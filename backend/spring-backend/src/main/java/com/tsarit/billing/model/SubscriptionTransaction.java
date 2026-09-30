package com.tsarit.billing.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Immutable ledger of plan purchases / payments per tenant.
 * Written on every successful subscription upgrade (Razorpay, UPI, manual, trial).
 */
@Entity
@Table(name = "subscription_transactions")
public class SubscriptionTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 50, nullable = false, updatable = false)
    private String id;

    @Column(name = "business_id", length = 50, nullable = false)
    private String businessId;

    @Column(name = "plan_id", length = 50)
    private String planId;

    @Column(name = "plan_name", length = 100)
    private String planName;

    @Column(name = "amount")
    private Double amount = 0.0;

    @Column(name = "payment_id", length = 100)
    private String paymentId;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod; // RAZORPAY, UPI, CARD, NETBANKING, MANUAL, FREE_TRIAL

    @Column(name = "status", length = 20, nullable = false)
    private String status; // SUCCESS, FAILED, PENDING

    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (status == null || status.isBlank()) {
            status = "SUCCESS";
        }
        if (paymentMethod == null || paymentMethod.isBlank()) {
            paymentMethod = "RAZORPAY";
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }
    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
