package com.tsarit.billing.dto;

import java.math.BigDecimal;

/**
 * All fields optional — the service fills defaults (role, payout type, salary 0)
 * for anything the caller leaves out, so app users are never blocked.
 */
public class StaffDto {

    private String id;

    private String name;

    private String mobileNumber;

    private String role;

    private String salaryPayoutType; // MONTHLY, WEEKLY, DAILY

    private BigDecimal salary;

    private String salaryCycle;
    private BigDecimal openingBalance;
    private String balanceType; // TO_PAY, TO_RECEIVE
    private String status; // ACTIVE, INACTIVE

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getSalaryPayoutType() {
        return salaryPayoutType;
    }

    public void setSalaryPayoutType(String salaryPayoutType) {
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

    public String getBalanceType() {
        return balanceType;
    }

    public void setBalanceType(String balanceType) {
        this.balanceType = balanceType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
