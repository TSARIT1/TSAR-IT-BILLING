package com.tsarit.billing.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_return_items")
public class PurchaseReturnItem {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    private PurchaseReturn purchaseReturn;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "quantity_returned", nullable = false)
    private Integer quantityReturned;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "tax", precision = 5, scale = 2)
    private BigDecimal tax;

    @Column(name = "discount", precision = 5, scale = 2)
    private BigDecimal discount;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "return_reason", columnDefinition = "TEXT")
    private String returnReason;

    @Column(name = "due_date")
    private java.time.LocalDate dueDate;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = IdGenerator.PurchaseReturnId();
        }
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public PurchaseReturnItem() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PurchaseReturn getPurchaseReturn() {
        return purchaseReturn;
    }

    public void setPurchaseReturn(PurchaseReturn purchaseReturn) {
        this.purchaseReturn = purchaseReturn;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getQuantityReturned() {
        return quantityReturned;
    }

    public void setQuantityReturned(Integer quantityReturned) {
        this.quantityReturned = quantityReturned;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getReturnReason() {
        return returnReason;
    }

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }

    public java.time.LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(java.time.LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
