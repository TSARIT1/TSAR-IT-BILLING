package com.tsarit.billing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_members")
public class Staff {

    @Id
    @Column(length = 20)
    private String id;

    @NotNull
    @Column(name = "business_id", nullable = false, length = 50)
    private String businessId;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String name;

    @NotBlank
    @Column(name = "mobile_number", nullable = false, length = 15)
    private String mobileNumber;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String role;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "salary_payout_type", nullable = false, length = 20)
    private SalaryPayoutType salaryPayoutType;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal salary;

    @Column(name = "salary_cycle", length = 100)
    private String salaryCycle;

    @Column(name = "opening_balance", precision = 10, scale = 2)
    private BigDecimal openingBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "balance_type", length = 20)
    private BalanceType balanceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SalaryPayoutType {
        MONTHLY, WEEKLY, DAILY
    }

    public enum BalanceType {
        TO_PAY, TO_RECEIVE
    }

    public enum Status {
        ACTIVE, INACTIVE
    }

    @PrePersist
    protected void onCreate() {
        this.id = IdGenerator.staffId();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = Status.ACTIVE;
        }
        if (this.openingBalance == null) {
            this.openingBalance = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBusinessId() {
        return businessId;
    }

    public void setBusinessId(String businessId) {
        this.businessId = businessId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public SalaryPayoutType getSalaryPayoutType() {
        return salaryPayoutType;
    }

    public void setSalaryPayoutType(SalaryPayoutType salaryPayoutType) {
        this.salaryPayoutType = salaryPayoutType;
    }

    public BigDecimal getSalary() {
        return salary;
    }

    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }

    public String getSalaryCycle() {
        return salaryCycle;
    }

    public void setSalaryCycle(String salaryCycle) {
        this.salaryCycle = salaryCycle;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(BigDecimal openingBalance) {
        this.openingBalance = openingBalance;
    }

    public BalanceType getBalanceType() {
        return balanceType;
    }

    public void setBalanceType(BalanceType balanceType) {
        this.balanceType = balanceType;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
