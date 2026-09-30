package com.tsarit.billing.controller;

import com.tsarit.billing.model.BankAccount;
import com.tsarit.billing.model.BankTransaction;
import com.tsarit.billing.model.Business;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserBusiness;
import com.tsarit.billing.repository.BankAccountRepository;
import com.tsarit.billing.repository.BankTransactionRepository;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.service.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/banking")
@CrossOrigin(originPatterns = "*")
public class BankController {

    @Autowired
    private BankService bankService;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private BankTransactionRepository bankTransactionRepository;

    @Autowired
    private UserBusinessRepository userBusinessRepository;

    /** Resolves the caller's primary business id, or null when unauthenticated. */
    private String callerBusinessId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        User caller = authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User u ? u : null;
        if (caller == null) {
            return null;
        }
        return userBusinessRepository.findByUserId(caller.getId()).stream()
                .findFirst()
                .map(UserBusiness::getBusiness)
                .map(Business::getId)
                .orElse(null);
    }

    /** Tenant-scoped account list — a business only ever sees its own accounts. */
    @GetMapping("/accounts")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllAccounts() {
        String bid = callerBusinessId();
        if (bid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        return ResponseEntity.ok(bankAccountRepository.findByBusinessIdOrderByCreatedAtDesc(bid));
    }

    @PostMapping("/accounts/create")
    @Transactional
    public ResponseEntity<?> createAccount(@RequestBody Map<String, Object> payload) {
        String bid = callerBusinessId();
        if (bid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        String bankName = (String) payload.get("bankName");
        String accountNumber = (String) payload.get("accountNumber");
        String ifscCode = (String) payload.get("ifscCode");
        String branchName = (String) payload.get("branchName");
        String accountType = (String) payload.get("accountType");
        String upiId = (String) payload.get("upiId");
        BigDecimal openingBal = payload.get("openingBalance") != null ?
                new BigDecimal(payload.get("openingBalance").toString()) : BigDecimal.ZERO;
        Boolean isPrimary = payload.get("isPrimary") != null ?
                Boolean.valueOf(payload.get("isPrimary").toString()) : false;

        if (bankName == null || bankName.isBlank() || accountNumber == null || accountNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bank name and account number are required"));
        }

        BankAccount saved = bankService.createAccount(bankName, accountNumber.trim(), ifscCode, branchName,
                accountType, upiId, openingBal, isPrimary);
        saved.setBusinessId(bid);
        saved = bankAccountRepository.save(saved);
        return ResponseEntity.ok(saved);
    }

    /** Tenant-scoped transactions — optionally filtered to one of the caller's own accounts. */
    @GetMapping("/transactions")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getTransactions(@RequestParam(required = false) String bankAccountId) {
        String bid = callerBusinessId();
        if (bid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        if (bankAccountId != null && !bankAccountId.isEmpty()) {
            // Only return the account's transactions if the account belongs to this tenant.
            boolean owned = bankAccountRepository.findByIdAndBusinessId(bankAccountId, bid).isPresent();
            if (!owned) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(
                    bankTransactionRepository.findByBankAccountIdOrderByTransactionDateDesc(bankAccountId));
        }
        return ResponseEntity.ok(
                bankTransactionRepository.findTop100ByBusinessIdOrderByTransactionDateDesc(bid));
    }

    @PostMapping("/transactions/record")
    @Transactional
    public ResponseEntity<?> recordTransaction(@RequestBody Map<String, Object> payload) {
        String bid = callerBusinessId();
        if (bid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        String bankAccountId = (String) payload.get("bankAccountId");
        String type = (String) payload.get("type");
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String refNo = (String) payload.get("referenceNumber");
        String description = (String) payload.get("description");

        // Ownership check: cannot move money on someone else's account.
        boolean owned = bankAccountId != null &&
                bankAccountRepository.findByIdAndBusinessId(bankAccountId, bid).isPresent();
        if (!owned) {
            return ResponseEntity.status(403).body(Map.of("error", "Bank account not found for your business"));
        }

        BankTransaction saved = bankService.recordTransaction(bankAccountId, LocalDate.now(), type, amount, refNo, description);
        saved.setBusinessId(bid);
        saved = bankTransactionRepository.save(saved);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/transactions/{id}/reconcile")
    @Transactional
    public ResponseEntity<?> reconcile(@PathVariable String id) {
        String bid = callerBusinessId();
        if (bid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        BankTransaction tx = bankTransactionRepository.findById(id).orElse(null);
        if (tx == null || !bid.equals(tx.getBusinessId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bankService.reconcileTransaction(id));
    }

    @DeleteMapping("/accounts/{id}")
    @Transactional
    public ResponseEntity<?> deleteAccount(@PathVariable String id) {
        String bid = callerBusinessId();
        if (bid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        boolean owned = bankAccountRepository.findByIdAndBusinessId(id, bid).isPresent();
        if (!owned) {
            return ResponseEntity.notFound().build();
        }
        boolean deleted = bankService.deleteAccount(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Bank account deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
