package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sms_messages", indexes = {
        @Index(name = "idx_sms_status", columnList = "status"),
        @Index(name = "idx_sms_created", columnList = "createdAt")
})
public class SmsMessage {

    public enum Status { QUEUED, SENT, DELIVERED, FAILED }
    public enum Kind { OTP, TRANSACTIONAL, PROMOTIONAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String toPhone;

    @Column(nullable = false, length = 1000)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Kind kind = Kind.TRANSACTIONAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.QUEUED;

    /** Which gateway phone sent it (deviceId). Null until picked up. */
    @Column(length = 100)
    private String sentViaDevice;

    @Column(length = 100)
    private String businessId;

    @Column(length = 500)
    private String error;

    private int attempts = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getToPhone() { return toPhone; }
    public void setToPhone(String toPhone) { this.toPhone = toPhone; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Kind getKind() { return kind; }
    public void setKind(Kind kind) { this.kind = kind; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getSentViaDevice() { return sentViaDevice; }
    public void setSentViaDevice(String sentViaDevice) { this.sentViaDevice = sentViaDevice; }
    public String getBusinessId() { return businessId; }
    public void setBusinessId(String businessId) { this.businessId = businessId; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
}
