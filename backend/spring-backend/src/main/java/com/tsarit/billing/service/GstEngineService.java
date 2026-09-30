package com.tsarit.billing.service;

import com.tsarit.billing.model.Invoice;
import com.tsarit.billing.model.InvoiceItems;
import com.tsarit.billing.repository.InvoiceItemsRepository;
import com.tsarit.billing.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class GstEngineService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired(required = false)
    private InvoiceItemsRepository invoiceItemsRepository;

    public static class TaxCalculationResult {
        public BigDecimal taxableAmount;
        public BigDecimal cgstRate;
        public BigDecimal cgstAmount;
        public BigDecimal sgstRate;
        public BigDecimal sgstAmount;
        public BigDecimal igstRate;
        public BigDecimal igstAmount;
        public BigDecimal cessAmount;
        public BigDecimal totalTax;
        public BigDecimal grandTotal;
        public boolean isInterState;
    }

    /**
     * Centralized tax calculation for any item or line.
     */
    public TaxCalculationResult calculateTax(BigDecimal baseAmount, BigDecimal gstRatePercent,
                                            String supplierStateCode, String recipientStateCode,
                                            BigDecimal cessPercent, boolean isReverseCharge) {
        TaxCalculationResult result = new TaxCalculationResult();
        if (baseAmount == null) baseAmount = BigDecimal.ZERO;
        if (gstRatePercent == null) gstRatePercent = BigDecimal.ZERO;
        if (cessPercent == null) cessPercent = BigDecimal.ZERO;

        result.taxableAmount = baseAmount;
        boolean isInter = (supplierStateCode != null && recipientStateCode != null &&
                          !supplierStateCode.equalsIgnoreCase(recipientStateCode));
        result.isInterState = isInter;

        if (isInter) {
            result.igstRate = gstRatePercent;
            result.igstAmount = baseAmount.multiply(gstRatePercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            result.cgstRate = BigDecimal.ZERO;
            result.cgstAmount = BigDecimal.ZERO;
            result.sgstRate = BigDecimal.ZERO;
            result.sgstAmount = BigDecimal.ZERO;
        } else {
            BigDecimal halfRate = gstRatePercent.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            result.cgstRate = halfRate;
            result.cgstAmount = baseAmount.multiply(halfRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            result.sgstRate = halfRate;
            result.sgstAmount = baseAmount.multiply(halfRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            result.igstRate = BigDecimal.ZERO;
            result.igstAmount = BigDecimal.ZERO;
        }

        result.cessAmount = baseAmount.multiply(cessPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        result.totalTax = result.cgstAmount.add(result.sgstAmount).add(result.igstAmount).add(result.cessAmount);
        result.grandTotal = result.taxableAmount.add(result.totalTax);
        return result;
    }

    /**
     * Generates standard GSTR-1 summary for statutory compliance.
     */
    public Map<String, Object> generateGstr1(String userId) {
        List<Invoice> invoices = (userId != null && !userId.isEmpty()) ?
                invoiceRepository.findByUser_Id(userId) : invoiceRepository.findAll();

        List<Map<String, Object>> b2bList = new ArrayList<>();
        List<Map<String, Object>> b2cList = new ArrayList<>();
        List<Map<String, Object>> hsnList = new ArrayList<>();

        BigDecimal totalTaxable = BigDecimal.ZERO;
        BigDecimal totalCgst = BigDecimal.ZERO;
        BigDecimal totalSgst = BigDecimal.ZERO;
        BigDecimal totalIgst = BigDecimal.ZERO;
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Invoice inv : invoices) {
            BigDecimal invTotal = BigDecimal.valueOf(inv.getTotalAmount());
            // Standard 18% tax calculation breakdown
            BigDecimal invTaxable = invTotal.divide(BigDecimal.valueOf(1.18), 2, RoundingMode.HALF_UP);
            BigDecimal invTax = invTotal.subtract(invTaxable);
            BigDecimal invCgst = invTax.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            BigDecimal invSgst = invTax.subtract(invCgst);
            BigDecimal invIgst = BigDecimal.ZERO;

            totalTaxable = totalTaxable.add(invTaxable);
            totalCgst = totalCgst.add(invCgst);
            totalSgst = totalSgst.add(invSgst);
            totalIgst = totalIgst.add(invIgst);
            grandTotal = grandTotal.add(invTotal);

            Map<String, Object> row = new HashMap<>();
            row.put("invoiceNo", inv.getInvoiceId());
            row.put("invoiceDate", inv.getInvoiceDate());
            row.put("customerName", inv.getCustomer() != null ? inv.getCustomer().getName() : "Client");
            row.put("taxableValue", invTaxable);
            row.put("cgst", invCgst);
            row.put("sgst", invSgst);
            row.put("igst", invIgst);
            row.put("totalInvoiceValue", invTotal);

            if (inv.getCustomer() != null && inv.getCustomer().getTaxId() != null && !inv.getCustomer().getTaxId().trim().isEmpty()) {
                row.put("gstin", inv.getCustomer().getTaxId());
                b2bList.add(row);
            } else {
                b2cList.add(row);
            }
        }

        // HSN Summary — grouped by line-item HSN (item hsn -> product hsn -> "NA").
        // Falls back to one row per GST rate when no HSN is stored yet.
        Map<String, Map<String, Object>> hsnGroups = new LinkedHashMap<>();
        if (invoiceItemsRepository != null) {
            for (Invoice inv : invoices) {
                List<InvoiceItems> lines;
                try {
                    lines = invoiceItemsRepository.findByInvoice_InvoiceIdAndIsDeletedFalse(inv.getInvoiceId());
                } catch (Exception e) {
                    lines = List.of();
                }
                for (InvoiceItems li : lines) {
                    String hsn = li.getHsnCode();
                    if ((hsn == null || hsn.isBlank()) && li.getProduct() != null) {
                        try { hsn = li.getProduct().getHsnCode(); } catch (Exception ignored) {}
                    }
                    if (hsn == null || hsn.isBlank()) hsn = "NA";
                    hsn = hsn.trim();
                    BigDecimal lineTotal = BigDecimal.valueOf(li.getTotalLineAmount());
                    double rate = li.getTax();
                    BigDecimal lineTaxable = rate > 0
                            ? lineTotal.divide(BigDecimal.valueOf(1 + rate / 100.0), 2, RoundingMode.HALF_UP)
                            : lineTotal;
                    BigDecimal lineTax = lineTotal.subtract(lineTaxable);
                    BigDecimal lineCgst = lineTax.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                    BigDecimal lineSgst = lineTax.subtract(lineCgst);
                    Map<String, Object> g = hsnGroups.computeIfAbsent(hsn, k -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("hsnCode", k);
                        m.put("description", k.equals("NA") ? "Unclassified items (add HSN in Inventory)" : "HSN " + k);
                        m.put("totalQuantity", 0);
                        m.put("taxableValue", BigDecimal.ZERO);
                        m.put("centralTax", BigDecimal.ZERO);
                        m.put("stateTax", BigDecimal.ZERO);
                        m.put("integratedTax", BigDecimal.ZERO);
                        return m;
                    });
                    g.put("totalQuantity", ((Number) g.get("totalQuantity")).intValue() + li.getQty());
                    g.put("taxableValue", ((BigDecimal) g.get("taxableValue")).add(lineTaxable));
                    g.put("centralTax", ((BigDecimal) g.get("centralTax")).add(lineCgst));
                    g.put("stateTax", ((BigDecimal) g.get("stateTax")).add(lineSgst));
                }
            }
        }
        if (hsnGroups.isEmpty()) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("hsnCode", "NA");
            fallback.put("description", "Unclassified items (add HSN in Inventory)");
            fallback.put("totalQuantity", invoices.size());
            fallback.put("taxableValue", totalTaxable);
            fallback.put("centralTax", totalCgst);
            fallback.put("stateTax", totalSgst);
            fallback.put("integratedTax", totalIgst);
            hsnList.add(fallback);
        } else {
            hsnList.addAll(hsnGroups.values());
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalTaxableValue", totalTaxable);
        summary.put("totalCgst", totalCgst);
        summary.put("totalSgst", totalSgst);
        summary.put("totalIgst", totalIgst);
        summary.put("totalTaxLiability", totalCgst.add(totalSgst).add(totalIgst));
        summary.put("grandTotal", grandTotal);
        summary.put("b2bInvoices", b2bList);
        summary.put("b2cInvoices", b2cList);
        summary.put("hsnSummary", hsnList);
        summary.put("totalInvoicesCount", invoices.size());
        return summary;
    }

    /**
     * Generates standard GSTR-3B summary.
     */
    public Map<String, Object> generateGstr3b(String userId) {
        Map<String, Object> gstr1 = generateGstr1(userId);

        Map<String, Object> outward = new HashMap<>();
        outward.put("natureOfSupplies", "3.1 (a) Outward taxable supplies (other than zero rated, nil rated and exempted)");
        outward.put("totalTaxableValue", gstr1.get("totalTaxableValue"));
        outward.put("integratedTax", gstr1.get("totalIgst"));
        outward.put("centralTax", gstr1.get("totalCgst"));
        outward.put("stateTax", gstr1.get("totalSgst"));
        outward.put("cess", BigDecimal.ZERO);

        // ITC must come from purchase-side data, never hardcoded. Until the
        // purchase-ITC feed is wired, report zeros so no false return is filed.
        Map<String, Object> itc = new HashMap<>();
        itc.put("itcCategory", "4 (A) (5) All other ITC (Inputs & Input Services)");
        itc.put("integratedTax", BigDecimal.ZERO);
        itc.put("centralTax", BigDecimal.ZERO);
        itc.put("stateTax", BigDecimal.ZERO);
        itc.put("cess", BigDecimal.ZERO);
        itc.put("note", "ITC pending purchase-side integration — verify in GSTR-2B before filing");

        Map<String, Object> result = new HashMap<>();
        result.put("outwardSupplies", outward);
        result.put("eligibleItc", itc);
        result.put("netTaxPayable", gstr1.get("totalTaxLiability"));
        return result;
    }
}
