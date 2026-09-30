package com.tsarit.billing.controller;

import com.tsarit.billing.model.Expense;
import com.tsarit.billing.repository.ExpenseRepository;
import com.tsarit.billing.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Vyapar/myBillBook-style expense tracking:
 *   GET    /api/expenses?businessId=...   list (newest first)
 *   POST   /api/expenses                  create
 *   DELETE /api/expenses/{id}             delete
 */
@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(originPatterns = "*")
public class ExpenseController {

    private static final DateTimeFormatter DATE_PARSE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final DateTimeFormatter DATE_PARSE_DAY =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ExpenseRepository expenseRepository;
    private final AuditService auditService;

    public ExpenseController(ExpenseRepository expenseRepository, AuditService auditService) {
        this.expenseRepository = expenseRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam("businessId") String businessId) {
        if (businessId == null || businessId.isBlank()) {
            return ResponseEntity.badRequest().body("businessId is required");
        }
        List<Expense> expenses = expenseRepository.findByBusinessIdOrderByExpenseDateDesc(businessId);
        double total = expenses.stream().mapToDouble(e -> e.getAmount() == null ? 0 : e.getAmount()).sum();
        return ResponseEntity.ok(Map.of(
                "expenses", expenses,
                "total", total,
                "count", expenses.size()));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Object bidObj = body.get("businessId");
        if (!(bidObj instanceof String bid) || bid.isBlank()) {
            return ResponseEntity.badRequest().body("businessId is required");
        }

        // All other fields optional with sensible defaults
        Object catObj = body.get("category");
        String cat = (catObj instanceof String s && !s.isBlank()) ? s : "Other";

        double amount = 0.0;
        Object amtObj = body.get("amount");
        if (amtObj instanceof Number n) {
            amount = n.doubleValue();
        } else if (amtObj instanceof String s && !s.isBlank()) {
            try { amount = Double.parseDouble(s.trim()); } catch (Exception ignored) {}
        }
        if (amount < 0) amount = 0.0;

        Expense expense = new Expense();
        expense.setBusinessId(bid);
        expense.setCategory(cat);
        expense.setAmount(amount);

        Object desc = body.get("description");
        if (desc instanceof String s && !s.isBlank()) expense.setDescription(s);

        Object mode = body.get("paymentMode");
        if (mode instanceof String s && !s.isBlank()) expense.setPaymentMode(s);

        Object vendor = body.get("vendorName");
        if (vendor instanceof String s && !s.isBlank()) expense.setVendorName(s);

        Object date = body.get("expenseDate");
        if (date instanceof String s && !s.isBlank()) {
            try {
                expense.setExpenseDate(LocalDateTime.parse(s, DATE_PARSE));
            } catch (Exception dayOnly) {
                expense.setExpenseDate(java.time.LocalDate.parse(s, DATE_PARSE_DAY).atStartOfDay());
            }
        }

        Expense saved = expenseRepository.save(expense);
        auditService.log(bid, "owner", "OWNER", "CREATE", "EXPENSE",
                saved.getExpenseId(), saved.getAmount(),
                "Expense added: " + saved.getCategory() + (saved.getDescription() != null ? " — " + saved.getDescription() : ""));
        return ResponseEntity.status(201).body(saved);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> delete(@PathVariable String expenseId) {
        Expense expense = expenseRepository.findById(expenseId).orElse(null);
        if (expense == null) {
            return ResponseEntity.status(404).body("Expense not found");
        }
        expenseRepository.deleteById(expenseId);
        auditService.log(expense.getBusinessId(), "owner", "OWNER", "DELETE", "EXPENSE",
                expenseId, expense.getAmount(), "Expense deleted: " + expense.getCategory());
        return ResponseEntity.ok("Expense deleted");
    }
}
