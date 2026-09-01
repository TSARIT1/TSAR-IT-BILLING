package com.tsarit.billing.service;

import com.tsarit.billing.model.BankAccount;
import com.tsarit.billing.model.BankTransaction;
import com.tsarit.billing.repository.BankAccountRepository;
import com.tsarit.billing.repository.BankTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class BankService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private BankTransactionRepository bankTransactionRepository;

    @Autowired
    private AuditService auditService;

    @Transactional
    public BankAccount createAccount(String bankName, String accountNumber, String ifsc,
                                     String branch, String type, String upiId, BigDecimal openingBal, Boolean isPrimary) {
        BankAccount account = new BankAccount(bankName, accountNumber, ifsc, branch, type, upiId, openingBal, isPrimary);
        BankAccount saved = bankAccountRepository.save(account);
        auditService.logEvent("BANKING", "CREATE_ACCOUNT", saved.getId(), null, "Created Bank Account " + bankName, accountNumber);
        return saved;
    }

    public List<BankAccount> getAllAccounts() {
        List<BankAccount> list = bankAccountRepository.findAllByOrderByCreatedAtDesc();
        if (list.isEmpty()) {
            // Seed default primary account
            createAccount("HDFC Bank", "50100234567890", "HDFC0001234", "Madhapur Branch, Hyderabad", "CURRENT", "tsaritbilling@hdfcbank", BigDecimal.valueOf(85850), true);
            createAccount("State Bank of India", "309876543210", "SBIN0004567", "Main Branch, Hyderabad", "CURRENT", "tsarit@sbi", BigDecimal.valueOf(42500), false);
            return bankAccountRepository.findAllByOrderByCreatedAtDesc();
        }
        return list;
    }

    @Transactional
    public BankTransaction recordTransaction(String bankAccountId, LocalDate date, String type,
                                             BigDecimal amount, String refNo, String description) {
        BankAccount account = bankAccountRepository.findById(bankAccountId).orElse(null);
        BankTransaction tx = new BankTransaction(bankAccountId, date, type, amount, refNo, description);

        if (account != null) {
            if ("DEPOSIT".equalsIgnoreCase(type)) {
                account.setCurrentBalance(account.getCurrentBalance().add(amount));
            } else if ("WITHDRAWAL".equalsIgnoreCase(type) || "PAYMENT".equalsIgnoreCase(type)) {
                account.setCurrentBalance(account.getCurrentBalance().subtract(amount));
            }
            bankAccountRepository.save(account);
        }

        BankTransaction saved = bankTransactionRepository.save(tx);
        auditService.logEvent("BANKING", "RECORD_TRANSACTION", saved.getId(), null, "Type: " + type + ", Amount: " + amount, refNo);
        return saved;
    }

    public List<BankTransaction> getTransactions(String bankAccountId) {
        if (bankAccountId != null && !bankAccountId.isEmpty()) {
            return bankTransactionRepository.findByBankAccountIdOrderByTransactionDateDesc(bankAccountId);
        }
        return bankTransactionRepository.findAllByOrderByTransactionDateDesc();
    }

    @Transactional
    public BankTransaction reconcileTransaction(String transactionId) {
        BankTransaction tx = bankTransactionRepository.findById(transactionId).orElse(null);
        if (tx != null) {
            tx.setIsReconciled(true);
            tx.setReconciliationDate(LocalDate.now());
            return bankTransactionRepository.save(tx);
        }
        return null;
    }
}
