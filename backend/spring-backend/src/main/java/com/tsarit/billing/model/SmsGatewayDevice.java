package com.tsarit.billing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sms_gateway_devices")
public class SmsGatewayDevice {

    @Id
    @Column(length = 100)
    private String deviceId;

    @Column(length = 100)
    private String name;

    /** Gateway SIM number (sender ID seen by customers). */
    @Column(length = 20)
    private String simNumber;

    private boolean active = true;

    private LocalDateTime lastSeen = LocalDateTime.now();
    private LocalDateTime registeredAt = LocalDateTime.now();

    /** Simple shared secret so random phones can't drain the queue. */
    @Column(length = 200)
    private String apiKey;

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSimNumber() { return simNumber; }
    public void setSimNumber(String simNumber) { this.simNumber = simNumber; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
}
