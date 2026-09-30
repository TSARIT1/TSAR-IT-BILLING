package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A Payment In receipt — money received from a customer. Stored server-side so
 * dues are real: on create, the payment is applied to the customer's oldest
 * unpaid sales and fully-covered sales are automatically marked paid.
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_business", columnList = "businessId"),
        @Index(name = "idx_payments_customer", columnList = "customerId")
})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-friendly receipt number, unique per business (PAY-0001…). */
    @Column(name = "payment_no", nullable = false, length = 30)
    private String paymentNo;

    @Column(name = "business_id", nullable = false, length = 50)
    private String businessId;

    /** Customer the money came from (null for walk-in receipts). */
    @Column(name = "customer_id")
    private Long customerId;

    /** Customer name captured at write time (survives customer renames/deletes). */
    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate = LocalDate.now();

    /** Cash / UPI / Bank Transfer / Cheque. */
    @Column(name = "payment_mode", length = 50)
    private String paymentMode = "Cash";

    /** Account the money landed in (Bank Account / Wallet / Cash). */
    @Column(name = "received_in", length = 100)
    private String receivedIn;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPaymentNo() { return paymentNo; }
    public void setPaymentNo(String paymentNo) { this.paymentNo = paymentNo; }
    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    public String getReceivedIn() { return receivedIn; }
    public void setReceivedIn(String receivedIn) { this.receivedIn = receivedIn; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
