package com.tsarit.billing.controller;

import com.tsarit.billing.model.BankAccount;
import com.tsarit.billing.model.BankTransaction;
import com.tsarit.billing.service.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banking")
@CrossOrigin(origins = "*")
public class BankController {

    @Autowired
    private BankService bankService;

    @GetMapping("/accounts")
    public ResponseEntity<List<BankAccount>> getAllAccounts() {
        return ResponseEntity.ok(bankService.getAllAccounts());
    }

    @PostMapping("/accounts/create")
    public ResponseEntity<BankAccount> createAccount(@RequestBody Map<String, Object> payload) {
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

        return ResponseEntity.ok(bankService.createAccount(bankName, accountNumber, ifscCode, branchName, accountType, upiId, openingBal, isPrimary));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<BankTransaction>> getTransactions(@RequestParam(required = false) String bankAccountId) {
        return ResponseEntity.ok(bankService.getTransactions(bankAccountId));
    }

    @PostMapping("/transactions/record")
    public ResponseEntity<BankTransaction> recordTransaction(@RequestBody Map<String, Object> payload) {
        String bankAccountId = (String) payload.get("bankAccountId");
        String type = (String) payload.get("type");
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String refNo = (String) payload.get("referenceNumber");
        String description = (String) payload.get("description");

        return ResponseEntity.ok(bankService.recordTransaction(bankAccountId, LocalDate.now(), type, amount, refNo, description));
    }

    @PostMapping("/transactions/{id}/reconcile")
    public ResponseEntity<BankTransaction> reconcile(@PathVariable String id) {
        return ResponseEntity.ok(bankService.reconcileTransaction(id));
    }
}
