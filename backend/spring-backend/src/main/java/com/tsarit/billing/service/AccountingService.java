package com.tsarit.billing.service;

import com.tsarit.billing.model.*;
import com.tsarit.billing.repository.AccountRepository;
import com.tsarit.billing.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class AccountingService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private AuditService auditService;

    /**
     * Initializes standard Indian Chart of Accounts for a new tenant or company.
     */
    @Transactional
    public void initializeDefaultChartOfAccounts(String tenantId, String companyId) {
        if (tenantId == null) tenantId = "default";
        if (companyId == null) companyId = "default";

        List<Account> existing = accountRepository.findByTenantId(tenantId);
        if (!existing.isEmpty()) return;

        List<Account> defaultAccounts = Arrays.asList(
            new Account(tenantId, companyId, "1001", "Cash-in-Hand", AccountType.ASSET, AccountGroup.CASH_AND_BANK, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "1002", "Primary Bank Account", AccountType.ASSET, AccountGroup.CASH_AND_BANK, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "1003", "Sundry Debtors (Customers)", AccountType.ASSET, AccountGroup.SUNDRY_DEBTORS, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "1004", "Input CGST", AccountType.ASSET, AccountGroup.DUTIES_AND_TAXES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "1005", "Input SGST", AccountType.ASSET, AccountGroup.DUTIES_AND_TAXES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "1006", "Input IGST", AccountType.ASSET, AccountGroup.DUTIES_AND_TAXES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "2001", "Sundry Creditors (Suppliers)", AccountType.LIABILITY, AccountGroup.SUNDRY_CREDITORS, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "2002", "Output CGST", AccountType.LIABILITY, AccountGroup.DUTIES_AND_TAXES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "2003", "Output SGST", AccountType.LIABILITY, AccountGroup.DUTIES_AND_TAXES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "2004", "Output IGST", AccountType.LIABILITY, AccountGroup.DUTIES_AND_TAXES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "3001", "Owner's Capital", AccountType.EQUITY, AccountGroup.CAPITAL_ACCOUNT, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "4001", "Sales Revenue", AccountType.INCOME, AccountGroup.SALES_ACCOUNTS, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "5001", "Purchase Cost of Goods", AccountType.EXPENSE, AccountGroup.PURCHASE_ACCOUNTS, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "5002", "General & Administrative Expenses", AccountType.EXPENSE, AccountGroup.INDIRECT_EXPENSES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "5003", "Rent & Utilities", AccountType.EXPENSE, AccountGroup.INDIRECT_EXPENSES, BigDecimal.ZERO, true),
            new Account(tenantId, companyId, "5004", "Staff Salaries & Wages", AccountType.EXPENSE, AccountGroup.INDIRECT_EXPENSES, BigDecimal.ZERO, true)
        );

        accountRepository.saveAll(defaultAccounts);
        auditService.logEvent("ACCOUNTING", "INIT_COA", tenantId, null, "Initialized 16 Standard Chart of Accounts", "Auto setup");
    }

    public Account getOrCreateAccount(String tenantId, String code, String name, AccountType type, AccountGroup group) {
        if (tenantId == null) tenantId = "default";
        String finalTenantId = tenantId;
        return accountRepository.findByTenantIdAndAccountCode(tenantId, code)
            .orElseGet(() -> accountRepository.save(new Account(finalTenantId, "default", code, name, type, group, BigDecimal.ZERO, false)));
    }

    /**
     * Automatically posts balanced double-entry journals for a Sales Invoice.
     * DR: Sundry Debtors (Grand Total)
     * CR: Sales Revenue (Taxable Amount)
     * CR: Output CGST / SGST / IGST
     */
    @Transactional
    public JournalEntry postSalesInvoice(String invoiceNo, String customerName, BigDecimal taxableAmt,
                                         BigDecimal cgst, BigDecimal sgst, BigDecimal igst,
                                         BigDecimal grandTotal, LocalDate date, String tenantId) {
        if (tenantId == null) tenantId = "default";
        initializeDefaultChartOfAccounts(tenantId, "default");

        Account debtorsAcc = getOrCreateAccount(tenantId, "1003", "Sundry Debtors (Customers)", AccountType.ASSET, AccountGroup.SUNDRY_DEBTORS);
        Account salesAcc = getOrCreateAccount(tenantId, "4001", "Sales Revenue", AccountType.INCOME, AccountGroup.SALES_ACCOUNTS);
        Account outCgstAcc = getOrCreateAccount(tenantId, "2002", "Output CGST", AccountType.LIABILITY, AccountGroup.DUTIES_AND_TAXES);
        Account outSgstAcc = getOrCreateAccount(tenantId, "2003", "Output SGST", AccountType.LIABILITY, AccountGroup.DUTIES_AND_TAXES);
        Account outIgstAcc = getOrCreateAccount(tenantId, "2004", "Output IGST", AccountType.LIABILITY, AccountGroup.DUTIES_AND_TAXES);

        String entryNo = "JRN-SALE-" + (invoiceNo != null ? invoiceNo : System.currentTimeMillis());
        JournalEntry entry = new JournalEntry(
            tenantId, "default", entryNo, date != null ? date : LocalDate.now(),
            invoiceNo, "SALES_INVOICE", "Sales invoice billed to " + customerName, grandTotal
        );

        // 1. Debit Debtors
        entry.addLine(new JournalEntryLine(debtorsAcc, grandTotal, BigDecimal.ZERO, "Receivable from " + customerName));
        debtorsAcc.setCurrentBalance(debtorsAcc.getCurrentBalance().add(grandTotal));

        // 2. Credit Sales Revenue
        entry.addLine(new JournalEntryLine(salesAcc, BigDecimal.ZERO, taxableAmt, "Sales revenue for " + invoiceNo));
        salesAcc.setCurrentBalance(salesAcc.getCurrentBalance().add(taxableAmt));

        // 3. Credit GST
        if (cgst != null && cgst.compareTo(BigDecimal.ZERO) > 0) {
            entry.addLine(new JournalEntryLine(outCgstAcc, BigDecimal.ZERO, cgst, "Output CGST liability"));
            outCgstAcc.setCurrentBalance(outCgstAcc.getCurrentBalance().add(cgst));
        }
        if (sgst != null && sgst.compareTo(BigDecimal.ZERO) > 0) {
            entry.addLine(new JournalEntryLine(outSgstAcc, BigDecimal.ZERO, sgst, "Output SGST liability"));
            outSgstAcc.setCurrentBalance(outSgstAcc.getCurrentBalance().add(sgst));
        }
        if (igst != null && igst.compareTo(BigDecimal.ZERO) > 0) {
            entry.addLine(new JournalEntryLine(outIgstAcc, BigDecimal.ZERO, igst, "Output IGST liability"));
            outIgstAcc.setCurrentBalance(outIgstAcc.getCurrentBalance().add(igst));
        }

        accountRepository.save(debtorsAcc);
        accountRepository.save(salesAcc);
        accountRepository.save(outCgstAcc);
        accountRepository.save(outSgstAcc);
        accountRepository.save(outIgstAcc);

        JournalEntry saved = journalEntryRepository.save(entry);
        auditService.logEvent("ACCOUNTING", "POST_JOURNAL", saved.getId(), null, "Posted Sales Journal " + entryNo, "Invoice: " + invoiceNo);
        return saved;
    }

    /**
     * Automatically posts balanced double-entry journals for a Customer Payment In.
     * DR: Cash or Bank (Amount)
     * CR: Sundry Debtors (Amount)
     */
    @Transactional
    public JournalEntry postCustomerPayment(String receiptNo, String customerName, BigDecimal amount,
                                            String paymentMode, LocalDate date, String tenantId) {
        if (tenantId == null) tenantId = "default";
        initializeDefaultChartOfAccounts(tenantId, "default");

        String bankOrCashCode = (paymentMode != null && paymentMode.equalsIgnoreCase("CASH")) ? "1001" : "1002";
        Account liquidAcc = getOrCreateAccount(tenantId, bankOrCashCode, (bankOrCashCode.equals("1001") ? "Cash-in-Hand" : "Primary Bank Account"), AccountType.ASSET, AccountGroup.CASH_AND_BANK);
        Account debtorsAcc = getOrCreateAccount(tenantId, "1003", "Sundry Debtors (Customers)", AccountType.ASSET, AccountGroup.SUNDRY_DEBTORS);

        String entryNo = "JRN-RCPT-" + (receiptNo != null ? receiptNo : System.currentTimeMillis());
        JournalEntry entry = new JournalEntry(
            tenantId, "default", entryNo, date != null ? date : LocalDate.now(),
            receiptNo, "PAYMENT_IN", "Payment received from " + customerName + " via " + paymentMode, amount
        );

        // DR Liquid Account
        entry.addLine(new JournalEntryLine(liquidAcc, amount, BigDecimal.ZERO, "Payment received in " + liquidAcc.getAccountName()));
        liquidAcc.setCurrentBalance(liquidAcc.getCurrentBalance().add(amount));

        // CR Debtors
        entry.addLine(new JournalEntryLine(debtorsAcc, BigDecimal.ZERO, amount, "Settlement against " + customerName));
        debtorsAcc.setCurrentBalance(debtorsAcc.getCurrentBalance().subtract(amount));

        accountRepository.save(liquidAcc);
        accountRepository.save(debtorsAcc);

        return journalEntryRepository.save(entry);
    }

    /**
     * Generates standard Trial Balance report across all accounts.
     */
    public Map<String, Object> generateTrialBalance(String tenantId) {
        if (tenantId == null) tenantId = "default";
        initializeDefaultChartOfAccounts(tenantId, "default");

        List<Account> accounts = accountRepository.findByTenantId(tenantId);
        List<Map<String, Object>> rows = new ArrayList<>();
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (Account acc : accounts) {
            BigDecimal bal = acc.getCurrentBalance();
            BigDecimal debit = BigDecimal.ZERO;
            BigDecimal credit = BigDecimal.ZERO;

            if (acc.getAccountType() == AccountType.ASSET || acc.getAccountType() == AccountType.EXPENSE) {
                if (bal.compareTo(BigDecimal.ZERO) >= 0) {
                    debit = bal;
                } else {
                    credit = bal.abs();
                }
            } else {
                if (bal.compareTo(BigDecimal.ZERO) >= 0) {
                    credit = bal;
                } else {
                    debit = bal.abs();
                }
            }

            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);

            Map<String, Object> r = new HashMap<>();
            r.put("accountId", acc.getId());
            r.put("code", acc.getAccountCode());
            r.put("name", acc.getAccountName());
            r.put("group", acc.getAccountGroup());
            r.put("type", acc.getAccountType());
            r.put("debit", debit);
            r.put("credit", credit);
            rows.add(r);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("accounts", rows);
        result.put("totalDebit", totalDebit);
        result.put("totalCredit", totalCredit);
        result.put("isBalanced", totalDebit.compareTo(totalCredit) == 0);
        return result;
    }

    /**
     * Generates Profit & Loss Statement.
     */
    public Map<String, Object> generateProfitAndLoss(String tenantId) {
        if (tenantId == null) tenantId = "default";
        initializeDefaultChartOfAccounts(tenantId, "default");

        List<Account> incomeAccs = accountRepository.findByTenantIdAndAccountType(tenantId, AccountType.INCOME);
        List<Account> expenseAccs = accountRepository.findByTenantIdAndAccountType(tenantId, AccountType.EXPENSE);

        BigDecimal totalIncome = incomeAccs.stream().map(Account::getCurrentBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenseAccs.stream().map(Account::getCurrentBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netProfit = totalIncome.subtract(totalExpense);

        Map<String, Object> result = new HashMap<>();
        result.put("incomeAccounts", incomeAccs);
        result.put("expenseAccounts", expenseAccs);
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);
        result.put("netProfit", netProfit);
        result.put("isProfitable", netProfit.compareTo(BigDecimal.ZERO) >= 0);
        return result;
    }

    /**
     * Generates Balance Sheet.
     */
    public Map<String, Object> generateBalanceSheet(String tenantId) {
        if (tenantId == null) tenantId = "default";
        initializeDefaultChartOfAccounts(tenantId, "default");

        List<Account> assetAccs = accountRepository.findByTenantIdAndAccountType(tenantId, AccountType.ASSET);
        List<Account> liabilityAccs = accountRepository.findByTenantIdAndAccountType(tenantId, AccountType.LIABILITY);
        List<Account> equityAccs = accountRepository.findByTenantIdAndAccountType(tenantId, AccountType.EQUITY);

        BigDecimal totalAssets = assetAccs.stream().map(Account::getCurrentBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLiabilities = liabilityAccs.stream().map(Account::getCurrentBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEquity = equityAccs.stream().map(Account::getCurrentBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("assetAccounts", assetAccs);
        result.put("liabilityAccounts", liabilityAccs);
        result.put("equityAccounts", equityAccs);
        result.put("totalAssets", totalAssets);
        result.put("totalLiabilities", totalLiabilities);
        result.put("totalEquity", totalEquity);
        result.put("totalLiabilitiesAndEquity", totalLiabilities.add(totalEquity));
        return result;
    }

    public List<Account> getAllAccounts(String tenantId) {
        if (tenantId == null) tenantId = "default";
        initializeDefaultChartOfAccounts(tenantId, "default");
        return accountRepository.findByTenantId(tenantId);
    }

    public List<JournalEntry> getDayBook(String tenantId) {
        if (tenantId == null) tenantId = "default";
        return journalEntryRepository.findByTenantIdOrderByEntryDateDesc(tenantId);
    }
}
