package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_business", columnList = "business_id"),
    @Index(name = "idx_notif_user", columnList = "user_id"),
    @Index(name = "idx_notif_created", columnList = "created_at")
})
public class Notification {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "business_id", length = 64)
    private String businessId;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 32)
    private String type = "INFO"; // INFO, SUCCESS, WARNING, DANGER, TRANSACTION, ALERT, UPDATE, ANNOUNCEMENT

    @Column(length = 32)
    private String category = "GENERAL"; // SALE, INVOICE, PAYMENT, EXPENSE, INVENTORY, TICKET, BANK, SYSTEM, ANNOUNCEMENT

    @Column(name = "reference_id", length = 128)
    private String referenceId;

    @Column(name = "action_url", length = 255)
    private String actionUrl;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(String id, String businessId, String userId, String title, String message,
                        String type, String category, String referenceId, String actionUrl, Double amount) {
        this.id = id;
        this.businessId = businessId;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type != null ? type : "INFO";
        this.category = category != null ? category : "GENERAL";
        this.referenceId = referenceId;
        this.actionUrl = actionUrl;
        this.amount = amount;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
