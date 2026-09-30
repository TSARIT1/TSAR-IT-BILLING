package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_settings", indexes = {
    @Index(name = "idx_notif_set_biz", columnList = "business_id"),
    @Index(name = "idx_notif_set_user", columnList = "user_id")
})
public class NotificationSetting {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "business_id", length = 64)
    private String businessId;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "sound_enabled", nullable = false)
    private boolean soundEnabled = true;

    @Column(name = "popup_enabled", nullable = false)
    private boolean popupEnabled = true;

    @Column(name = "sales_alerts", nullable = false)
    private boolean salesAlerts = true;

    @Column(name = "payment_alerts", nullable = false)
    private boolean paymentAlerts = true;

    @Column(name = "invoice_alerts", nullable = false)
    private boolean invoiceAlerts = true;

    @Column(name = "expense_alerts", nullable = false)
    private boolean expenseAlerts = true;

    @Column(name = "low_stock_alerts", nullable = false)
    private boolean lowStockAlerts = true;

    @Column(name = "ticket_alerts", nullable = false)
    private boolean ticketAlerts = true;

    @Column(name = "system_announcements", nullable = false)
    private boolean systemAnnouncements = true;

    @Column(name = "email_alerts", nullable = false)
    private boolean emailAlerts = false;

    @Column(name = "min_amount_threshold")
    private Double minAmountThreshold = 0.0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public NotificationSetting() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isSoundEnabled() { return soundEnabled; }
    public void setSoundEnabled(boolean soundEnabled) { this.soundEnabled = soundEnabled; }

    public boolean isPopupEnabled() { return popupEnabled; }
    public void setPopupEnabled(boolean popupEnabled) { this.popupEnabled = popupEnabled; }

    public boolean isSalesAlerts() { return salesAlerts; }
    public void setSalesAlerts(boolean salesAlerts) { this.salesAlerts = salesAlerts; }

    public boolean isPaymentAlerts() { return paymentAlerts; }
    public void setPaymentAlerts(boolean paymentAlerts) { this.paymentAlerts = paymentAlerts; }

    public boolean isInvoiceAlerts() { return invoiceAlerts; }
    public void setInvoiceAlerts(boolean invoiceAlerts) { this.invoiceAlerts = invoiceAlerts; }

    public boolean isExpenseAlerts() { return expenseAlerts; }
    public void setExpenseAlerts(boolean expenseAlerts) { this.expenseAlerts = expenseAlerts; }

    public boolean isLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(boolean lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }

    public boolean isTicketAlerts() { return ticketAlerts; }
    public void setTicketAlerts(boolean ticketAlerts) { this.ticketAlerts = ticketAlerts; }

    public boolean isSystemAnnouncements() { return systemAnnouncements; }
    public void setSystemAnnouncements(boolean systemAnnouncements) { this.systemAnnouncements = systemAnnouncements; }

    public boolean isEmailAlerts() { return emailAlerts; }
    public void setEmailAlerts(boolean emailAlerts) { this.emailAlerts = emailAlerts; }

    public Double getMinAmountThreshold() { return minAmountThreshold; }
    public void setMinAmountThreshold(Double minAmountThreshold) { this.minAmountThreshold = minAmountThreshold; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
