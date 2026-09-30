package com.tsarit.billing.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_subscriptions")
public class TenantSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 50, nullable = false, updatable = false)
    private String id;

    @Column(name = "business_id", length = 50, nullable = false)
    private String businessId;

    @Column(name = "plan_id", length = 50, nullable = false)
    private String planId; // e.g. trial_15_days, plan_1_month, plan_3_months, plan_6_months, plan_1_year, plan_2_years

    @Column(name = "plan_name", length = 100, nullable = false)
    private String planName;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // ACTIVE, TRIAL, EXPIRED

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "amount_paid")
    private Double amountPaid = 0.0;

    @Column(name = "payment_id", length = 100)
    private String paymentId;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // RAZORPAY, UPI, FREE_TRIAL, MANUAL

    @Column(name = "max_users")
    private int maxUsers = 5;

    @Column(name = "max_godowns")
    private int maxGodowns = 5;

    @Column(name = "max_invoices_per_month")
    private int maxInvoicesPerMonth = 1000;

    @Column(name = "e_invoice_enabled")
    private boolean eInvoiceEnabled = true;

    @Column(name = "pos_enabled")
    private boolean posEnabled = true;

    @Column(name = "sms_credits")
    private int smsCredits = 100;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TenantSubscription() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public int getMaxUsers() { return maxUsers; }
    public void setMaxUsers(int maxUsers) { this.maxUsers = maxUsers; }

    public int getMaxGodowns() { return maxGodowns; }
    public void setMaxGodowns(int maxGodowns) { this.maxGodowns = maxGodowns; }

    public int getMaxInvoicesPerMonth() { return maxInvoicesPerMonth; }
    public void setMaxInvoicesPerMonth(int maxInvoicesPerMonth) { this.maxInvoicesPerMonth = maxInvoicesPerMonth; }

    public boolean isEInvoiceEnabled() { return eInvoiceEnabled; }
    public void setEInvoiceEnabled(boolean eInvoiceEnabled) { this.eInvoiceEnabled = eInvoiceEnabled; }

    public boolean isPosEnabled() { return posEnabled; }
    public void setPosEnabled(boolean posEnabled) { this.posEnabled = posEnabled; }

    public int getSmsCredits() { return smsCredits; }
    public void setSmsCredits(int smsCredits) { this.smsCredits = smsCredits; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
