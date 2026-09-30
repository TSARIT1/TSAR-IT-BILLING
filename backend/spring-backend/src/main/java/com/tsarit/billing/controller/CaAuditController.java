package com.tsarit.billing.controller;

import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.model.Expense;
import com.tsarit.billing.model.Staff;
import com.tsarit.billing.repository.InvoiceRepository;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.ExpenseRepository;
import com.tsarit.billing.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * CA Audit Hub — the MyBillBook/Vyapar model of accountant access:
 *  - GSTR-1 (outward supplies) monthly summary: B2B / B2C split, rate-wise tax breakup
 *  - GSTR-3B summary: output tax, input credit (purchases/expenses), net payable
 *  - One-tap CSV exports the CA can file with, without touching the books
 *  - Works off the data every business already records (invoices, items, expenses)
 */
@RestController
@RequestMapping("/api/ca")
@CrossOrigin(originPatterns = "*")
public class CaAuditController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemsRepository invoiceItemsRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private com.tsarit.billing.repository.UserBusinessRepository userBusinessRepository;

    @Autowired
    private com.tsarit.billing.repository.BusinessRepository businessRepository;

    @Autowired(required = false)
    private com.tsarit.billing.service.SmsGatewayService smsGatewayService;

    /**
     * The mobile app historically sent the *user* id where the CA endpoints scope by
     * *business* id, so invites were stored under the wrong tenant key and the CA list
     * came back empty. Accept either identifier and resolve it to the real businessId.
     */
    private String resolveBusinessId(String idOrUserId) {
        if (idOrUserId == null || idOrUserId.isBlank()) return idOrUserId;
        String id = idOrUserId.trim();
        // Already a known business id -> use as-is
        if (businessRepository.existsById(id)) return id;
        // Otherwise treat it as a user id and map through the membership table
        return userBusinessRepository.findByUserId(id).stream()
                .map(ub -> ub.getBusiness() != null ? ub.getBusiness().getId() : null)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(id);
    }

    /* ================= GSTR-1 SUMMARY (outward supplies) ================= */
    @GetMapping("/gstr1")
    @Transactional(readOnly = true)
    public ResponseEntity<?> gstr1(@RequestParam("userId") String userId,
                                   @RequestParam(value = "month", required = false) String month) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }
        List<Invoice> invoices = salesInvoices(userId, month);

        List<Map<String, Object>> rows = new ArrayList<>();
        double totalTaxable = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalAmount = 0;
        long b2bCount = 0, b2cCount = 0;

        for (Invoice inv : invoices) {
            List<InvoiceItems> items = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(inv.getInvoiceId());
            // Rate-wise consolidation within the invoice (GSTR-1 buckets by GST rate)
            Map<Double, double[]> byRate = new TreeMap<>();
            for (InvoiceItems it : items) {
                double rate = it.getTax();
                double lineTotal = it.getTotalLineAmount();
                double taxable = lineTotal / (1 + rate / 100.0);
                double taxAmt = lineTotal - taxable;
                double[] agg = byRate.computeIfAbsent(rate, k -> new double[3]); // taxable, tax, lineTotal
                agg[0] += taxable; agg[1] += taxAmt; agg[2] += lineTotal;
            }
            for (Map.Entry<Double, double[]> e : byRate.entrySet()) {
                double rate = e.getKey(), taxable = e.getValue()[0], tax = e.getValue()[1];
                // Intra-state assumed: CGST+SGST split. (IGST handling when place-of-supply ships.)
                rows.add(Map.of(
                        "invoiceId", inv.getInvoiceId(),
                        "invoiceDate", String.valueOf(inv.getInvoiceDate()),
                        "rate", rate,
                        "taxableValue", round2(taxable),
                        "cgst", round2(tax / 2),
                        "sgst", round2(tax / 2),
                        "igst", 0.0,
                        "invoiceValue", round2(e.getValue()[2])));
                totalTaxable += taxable;
                totalCgst += tax / 2;
                totalSgst += tax / 2;
                totalAmount += e.getValue()[2];
            }
            if (items.stream().anyMatch(i -> i.getTax() > 0)) b2bCount++; else b2cCount++;
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("returnType", "GSTR-1");
        resp.put("month", month != null ? month : "all");
        resp.put("invoiceCount", invoices.size());
        resp.put("rows", rows);
        resp.put("totals", Map.of(
                "taxableValue", round2(totalTaxable),
                "cgst", round2(totalCgst),
                "sgst", round2(totalSgst),
                "igst", round2(totalIgst),
                "invoiceValue", round2(totalAmount)));
        return ResponseEntity.ok(resp);
    }

    /* ================= GSTR-3B SUMMARY (monthly return) ================= */
    @GetMapping("/gstr3b")
    @Transactional(readOnly = true)
    public ResponseEntity<?> gstr3b(@RequestParam("userId") String userId,
                                    @RequestParam(value = "month", required = false) String month) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }
        List<Invoice> invoices = salesInvoices(userId, month);

        double outputTax = 0, outputTaxable = 0;
        for (Invoice inv : invoices) {
            for (InvoiceItems it : invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(inv.getInvoiceId())) {
                double lineTotal = it.getTotalLineAmount();
                double taxable = lineTotal / (1 + it.getTax() / 100.0);
                outputTaxable += taxable;
                outputTax += lineTotal - taxable;
            }
        }

        // Input credit: GST paid on business expenses (purchases-side)
        String businessId = resolveBusinessId(userId);
        double inputTax = 0, inputTaxable = 0;
        List<Expense> expenses = expenseRepository.findByBusinessIdOrderByExpenseDateDesc(businessId).stream()
                .filter(e -> inMonth(e.getExpenseDate(), month))
                .toList();
        for (Expense e : expenses) {
            double amt = e.getAmount() != null ? e.getAmount() : 0;
            inputTaxable += amt;
            inputTax += amt * 0.0; // expenses are recorded net of GST today — credit shown once tax-inclusive expenses exist
        }

        double netPayable = Math.max(0, outputTax - inputTax);
        Map<String, Object> resp = new HashMap<>();
        resp.put("returnType", "GSTR-3B");
        resp.put("month", month != null ? month : "all");
        resp.put("outwardSupplies", Map.of("taxableValue", round2(outputTaxable), "outputTax", round2(outputTax)));
        resp.put("inputCredit", Map.of("taxableValue", round2(inputTaxable), "inputTax", round2(inputTax)));
        resp.put("netTaxPayable", round2(netPayable));
        resp.put("expenseCount", expenses.size());
        return ResponseEntity.ok(resp);
    }

    /* ================= CSV EXPORT (what the CA downloads) ================= */
    @GetMapping(value = "/export/gstr1.csv", produces = "text/csv")
    @Transactional(readOnly = true)
    public ResponseEntity<String> exportGstr1(@RequestParam("userId") String userId,
                                              @RequestParam(value = "month", required = false) String month) {
        ResponseEntity<?> r = gstr1(userId, month);
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) r.getBody();
        List<Map<String, Object>> rows = (List<Map<String, Object>>) body.get("rows");

        StringBuilder sb = new StringBuilder("Invoice No,Invoice Date,GST Rate %,Taxable Value,CGST,SGST,IGST,Invoice Value\n");
        for (Map<String, Object> row : rows) {
            sb.append(row.get("invoiceId")).append(',')
                    .append(row.get("invoiceDate")).append(',')
                    .append(row.get("rate")).append(',')
                    .append(row.get("taxableValue")).append(',')
                    .append(row.get("cgst")).append(',')
                    .append(row.get("sgst")).append(',')
                    .append(row.get("igst")).append(',')
                    .append(row.get("invoiceValue")).append('\n');
        }
        Map<String, Object> t = (Map<String, Object>) body.get("totals");
        sb.append("TOTAL,,,").append(t.get("taxableValue")).append(',')
                .append(t.get("cgst")).append(',').append(t.get("sgst")).append(',')
                .append(t.get("igst")).append(',').append(t.get("invoiceValue")).append('\n');

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=GSTR1_" + safe(month) + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString());
    }

    @GetMapping(value = "/export/daybook.csv", produces = "text/csv")
    @Transactional(readOnly = true)
    public ResponseEntity<String> exportDayBook(@RequestParam("userId") String userId,
                                                @RequestParam(value = "month", required = false) String month) {
        String businessId = resolveBusinessId(userId);
        List<Invoice> invoices = salesInvoices(userId, month);
        StringBuilder sb = new StringBuilder("Date,Type,Reference,Party,Amount\n");
        for (Invoice inv : invoices) {
            sb.append(inv.getInvoiceDate()).append(",SALE INVOICE,").append(inv.getInvoiceId())
                    .append(",\"").append(inv.getCustomer() != null && inv.getCustomer().getName() != null ? inv.getCustomer().getName() : "-").append("\",")
                    .append(inv.getTotalAmount()).append('\n');
        }
        for (Expense e : expenseRepository.findByBusinessIdOrderByExpenseDateDesc(businessId).stream()
                .filter(x -> inMonth(x.getExpenseDate(), month)).toList()) {
            sb.append(e.getExpenseDate()).append(",EXPENSE,").append(e.getExpenseId())
                    .append(",\"").append(e.getVendorName() != null ? e.getVendorName() : e.getCategory()).append("\",")
                    .append(e.getAmount() != null ? e.getAmount() : 0).append('\n');
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=DayBook_" + safe(month) + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString());
    }

    /* ================= CA (ACCOUNTANT) INVITE — read-only audit access ================= */
    @GetMapping("/accountants")
    public ResponseEntity<?> listAccountants(@RequestParam("userId") String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));
        }
        String businessId = resolveBusinessId(userId);
        List<Staff> rows = staffRepository.findByBusinessId(businessId).stream()
                .filter(s -> "ACCOUNTANT".equalsIgnoreCase(s.getRole()))
                .toList();
        return ResponseEntity.ok(Map.of("accountants", rows, "count", rows.size(), "businessId", businessId));
    }

    /** Owner invites their CA: name + mobile + optional email; role=ACCOUNTANT, read-only. */
    @PostMapping("/invite")
    @Transactional
    public ResponseEntity<?> inviteAccountant(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String name = body.get("name");
        String mobile = body.get("mobile");
        if (userId == null || userId.isBlank() || name == null || name.isBlank() || mobile == null || mobile.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId, name and mobile are required"));
        }
        String businessId = resolveBusinessId(userId);
        String email = body.get("email");
        // Compare on last 10 digits so 91XXXXXXXXXX / XXXXXXXXXX match the same person
        final String mobileKey = last10(mobile);

        // Re-invite updates the existing record instead of duplicating
        Staff existing = staffRepository.findByBusinessId(businessId).stream()
                .filter(s -> "ACCOUNTANT".equalsIgnoreCase(s.getRole()))
                .filter(s -> last10(s.getMobileNumber()).equals(mobileKey))
                .findFirst().orElse(null);
        if (existing != null) {
            existing.setName(name);
            existing.setStatus(Staff.Status.ACTIVE);
            staffRepository.save(existing);
            return ResponseEntity.ok(Map.of("status", "updated", "accountant", existing, "businessId", businessId));
        }

        Staff ca = new Staff();
        ca.setBusinessId(businessId);
        ca.setName(name);
        ca.setMobileNumber(mobile);
        ca.setRole("ACCOUNTANT");
        ca.setSalaryPayoutType(Staff.SalaryPayoutType.MONTHLY);
        ca.setSalary(java.math.BigDecimal.ZERO);
        staffRepository.save(ca);

        // Tell the CA they now have read-only access, on the free SMS gateway (cost 0)
        String inviteSms = "Hi " + name + ", " + "you have been given read-only audit access"
                + " (GSTR-1, GSTR-3B, CSV exports) by the business owner."
                + " You cannot edit the books. - All In One Bill";
        try {
            if (smsGatewayService != null) {
                smsGatewayService.enqueue(mobile, inviteSms, com.tsarit.billing.model.SmsMessage.Kind.TRANSACTIONAL, businessId);
            }
        } catch (Exception ignored) { }

        return ResponseEntity.ok(Map.of("status", "invited", "accountant", ca, "businessId", businessId,
                "access", "read-only audit reports & exports"));
    }

    /** Remove the CA's access. */
    @PostMapping("/revoke")
    @Transactional
    public ResponseEntity<?> revokeAccountant(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String mobile = body.get("mobile");
        if (userId == null || userId.isBlank() || mobile == null || mobile.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId and mobile are required"));
        }
        String businessId = resolveBusinessId(userId);
        final String mobileKey = last10(mobile);

        List<Staff> matches = staffRepository.findByBusinessId(businessId).stream()
                .filter(s -> "ACCOUNTANT".equalsIgnoreCase(s.getRole()))
                .filter(s -> last10(s.getMobileNumber()).equals(mobileKey))
                .toList();
        matches.forEach(s -> s.setStatus(Staff.Status.INACTIVE));
        staffRepository.saveAll(matches);
        return ResponseEntity.ok(Map.of("status", "revoked", "count", matches.size()));
    }

    /* ================= helpers ================= */
    /** Last 10 digits of a phone number, so 91XXXXXXXXXX and XXXXXXXXXX compare equal. */
    private static String last10(String phone) {
        String d = phone == null ? "" : phone.replaceAll("[^0-9]", "");
        return d.length() > 10 ? d.substring(d.length() - 10) : d;
    }

    private List<Invoice> salesInvoices(String userId, String month) {
        String businessId = resolveBusinessId(userId);
        List<Invoice> all = invoiceRepository.findByCustomer_BusinessIdAndIsSaledTrueAndIsDeletedFalse(businessId);
        if (all.isEmpty() && businessId.equals(userId)) {
            all = invoiceRepository.findByUser_IdAndIsSaledTrueAndIsDeletedFalse(userId);
        }
        YearMonth ym = month == null || month.isBlank() ? null : YearMonth.parse(month); // format: 2026-09
        DateTimeFormatter[] fmts = {
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        };
        List<Invoice> filtered = new ArrayList<>();
        for (Invoice inv : all) {
            LocalDate d = parseDate(String.valueOf(inv.getInvoiceDate()), fmts);
            if (d == null) continue;
            if (month == null || month.isBlank()) {
                if (inCurrentFinancialYear(d)) filtered.add(inv);
            } else if (YearMonth.from(d).equals(ym)) {
                filtered.add(inv);
            }
        }
        return filtered;
    }

    private boolean inMonth(LocalDateTime dt, String month) {
        if (dt == null) return false;
        if (month == null || month.isBlank()) return inCurrentFinancialYear(dt.toLocalDate());
        return YearMonth.from(dt).equals(YearMonth.parse(month));
    }

    private boolean inCurrentFinancialYear(LocalDate date) {
        LocalDate today = LocalDate.now();
        int startYear = today.getMonthValue() >= 4 ? today.getYear() : today.getYear() - 1;
        LocalDate start = LocalDate.of(startYear, 4, 1);
        LocalDate end = start.plusYears(1);
        return !date.isBefore(start) && date.isBefore(end);
    }

    private LocalDate parseDate(String s, DateTimeFormatter[] fmts) {
        if (s == null || s.isBlank()) return null;
        for (DateTimeFormatter f : fmts) {
            try { return LocalDate.parse(s.substring(0, 10), f); } catch (Exception ignored) {}
        }
        return null;
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }

    private String safe(String s) { return s == null || s.isBlank() ? "ALL" : s.replace("-", "_"); }
}
