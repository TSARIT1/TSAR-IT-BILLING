package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id", length = 50, nullable = false, updatable = false)
    private String id;

    @Column(name = "bank_account_id", nullable = false)
    private String bankAccountId;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "type", nullable = false)
    private String type; // DEPOSIT, WITHDRAWAL, TRANSFER, CHEQUE

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "reference_number")
    private String referenceNumber; // UTR, Cheque No, Transaction ID

    @Column(name = "description")
    private String description;

    @Column(name = "is_reconciled")
    private Boolean isReconciled = false;

    @Column(name = "reconciliation_date")
    private LocalDate reconciliationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public BankTransaction() {}

    public BankTransaction(String bankAccountId, LocalDate transactionDate, String type,
                           BigDecimal amount, String referenceNumber, String description) {
        this.bankAccountId = bankAccountId;
        this.transactionDate = transactionDate != null ? transactionDate : LocalDate.now();
        this.type = type;
        this.amount = amount != null ? amount : BigDecimal.ZERO;
        this.referenceNumber = referenceNumber;
        this.description = description;
        this.isReconciled = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBankAccountId() { return bankAccountId; }
    public void setBankAccountId(String bankAccountId) { this.bankAccountId = bankAccountId; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsReconciled() { return isReconciled; }
    public void setIsReconciled(Boolean isReconciled) { this.isReconciled = isReconciled; }

    public LocalDate getReconciliationDate() { return reconciliationDate; }
    public void setReconciliationDate(LocalDate reconciliationDate) { this.reconciliationDate = reconciliationDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
