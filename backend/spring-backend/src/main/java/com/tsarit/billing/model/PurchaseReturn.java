package com.tsarit.billing.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_returns")
public class PurchaseReturn {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", referencedColumnName = "invoice_id")
    private Invoice invoice;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(name = "status", length = 20)
    private String status = "NOT_RECEIVED";

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @OneToMany(mappedBy = "purchaseReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseReturnItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = IdGenerator.PurchaseReturnId();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (returnDate == null) {
            returnDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PurchaseReturn() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public List<PurchaseReturnItem> getItems() {
        return items;
    }

    public void setItems(List<PurchaseReturnItem> items) {
        this.items = items;
    }

    public void addItem(PurchaseReturnItem item) {
        items.add(item);
        item.setPurchaseReturn(this);
    }

    public void removeItem(PurchaseReturnItem item) {
        items.remove(item);
        item.setPurchaseReturn(null);
    }
}
