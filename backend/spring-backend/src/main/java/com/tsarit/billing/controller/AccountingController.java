package com.tsarit.billing.controller;

import com.tsarit.billing.model.Account;
import com.tsarit.billing.model.JournalEntry;
import com.tsarit.billing.service.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounting")
@CrossOrigin(originPatterns = "*")
public class AccountingController {

    @Autowired
    private AccountingService accountingService;

    @GetMapping("/chart-of-accounts")
    public ResponseEntity<List<Account>> getChartOfAccounts(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(accountingService.getAllAccounts(tenantId));
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<Map<String, Object>> getTrialBalance(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(accountingService.generateTrialBalance(tenantId));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<Map<String, Object>> getProfitAndLoss(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(accountingService.generateProfitAndLoss(tenantId));
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> getBalanceSheet(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(accountingService.generateBalanceSheet(tenantId));
    }

    @GetMapping("/day-book")
    public ResponseEntity<List<JournalEntry>> getDayBook(@RequestParam(required = false, defaultValue = "default") String tenantId) {
        return ResponseEntity.ok(accountingService.getDayBook(tenantId));
    }
}
