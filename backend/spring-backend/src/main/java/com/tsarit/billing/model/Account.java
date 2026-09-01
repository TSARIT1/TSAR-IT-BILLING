package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts", indexes = {
    @Index(name = "idx_account_tenant", columnList = "tenant_id"),
    @Index(name = "idx_account_code", columnList = "account_code"),
    @Index(name = "idx_account_type", columnList = "account_type")
})
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "account_id", length = 50, nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(name = "company_id", length = 50)
    private String companyId;

    @Column(name = "account_code", length = 30)
    private String accountCode;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_group", nullable = false)
    private AccountGroup accountGroup;

    @Column(name = "opening_balance", precision = 15, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "current_balance", precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "is_system_account")
    private Boolean isSystemAccount = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Account() {}

    public Account(String tenantId, String companyId, String accountCode, String accountName,
                   AccountType accountType, AccountGroup accountGroup, BigDecimal openingBalance,
                   Boolean isSystemAccount) {
        this.tenantId = tenantId;
        this.companyId = companyId;
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.accountType = accountType;
        this.accountGroup = accountGroup;
        this.openingBalance = openingBalance != null ? openingBalance : BigDecimal.ZERO;
        this.currentBalance = this.openingBalance;
        this.isSystemAccount = isSystemAccount != null ? isSystemAccount : false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public AccountGroup getAccountGroup() { return accountGroup; }
    public void setAccountGroup(AccountGroup accountGroup) { this.accountGroup = accountGroup; }

    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public Boolean getIsSystemAccount() { return isSystemAccount; }
    public void setIsSystemAccount(Boolean isSystemAccount) { this.isSystemAccount = isSystemAccount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
