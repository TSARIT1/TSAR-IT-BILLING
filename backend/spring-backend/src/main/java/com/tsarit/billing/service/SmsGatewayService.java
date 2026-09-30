package com.tsarit.billing.service;

import com.tsarit.billing.model.SmsGatewayDevice;
import com.tsarit.billing.model.SmsMessage;
import com.tsarit.billing.repository.SmsGatewayDeviceRepository;
import com.tsarit.billing.repository.SmsMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Own-SIM SMS gateway queue.
 *
 * Free route: one Android phone with an unlimited-SMS plan acts as the sender.
 * Backend only queues; the gateway phone polls /api/sms-gateway/poll,
 * sends via SmsManager, then POSTs /api/sms-gateway/report.
 *
 * No per-SMS gateway fee. Cost = SIM recharge only.
 * Keep promo volume per SIM under ~150-200/day to avoid TRAI spam blocks.
 */
@Service
public class SmsGatewayService {

    @Autowired
    private SmsMessageRepository smsRepo;

    @Autowired
    private SmsGatewayDeviceRepository deviceRepo;

    @Value("${sms.gateway.poll-batch-size:10}")
    private int pollBatchSize = 10;

    @Value("${sms.gateway.api-key:}")
    private String gatewayApiKey = "";

    public SmsMessage enqueue(String toPhone, String text, SmsMessage.Kind kind, String businessId) {
        if (toPhone == null || toPhone.isBlank() || text == null || text.isBlank()) {
            throw new IllegalArgumentException("toPhone and text are required");
        }
        String digits = toPhone.replaceAll("[^0-9]", "");
        // Keep last 10 for India + optional country prefix
        if (digits.length() > 13) digits = digits.substring(digits.length() - 13);
        SmsMessage m = new SmsMessage();
        m.setToPhone(digits);
        m.setText(text.length() > 1000 ? text.substring(0, 1000) : text);
        m.setKind(kind == null ? SmsMessage.Kind.TRANSACTIONAL : kind);
        m.setBusinessId(businessId);
        m.setStatus(SmsMessage.Status.QUEUED);
        return smsRepo.save(m);
    }

    public List<SmsMessage> enqueueBulk(List<String> phones, String text, SmsMessage.Kind kind, String businessId) {
        List<SmsMessage> out = new ArrayList<>();
        if (phones == null) return out;
        for (String p : phones) {
            try {
                out.add(enqueue(p, text, kind, businessId));
            } catch (Exception ignored) { }
        }
        return out;
    }

    /** Gateway phone calls this every ~10s. Returns oldest QUEUED batch. */
    public synchronized List<SmsMessage> poll(String deviceId, int limit) {
        touchDevice(deviceId, null);
        List<SmsMessage> queued = smsRepo.findTop50ByStatusOrderByCreatedAtAsc(SmsMessage.Status.QUEUED);
        int n = Math.min(limit <= 0 ? pollBatchSize : Math.min(limit, 50), queued.size());
        List<SmsMessage> batch = queued.subList(0, n);
        // Mark as picked up so two phones don't double-send
        for (SmsMessage m : batch) {
            m.setAttempts(m.getAttempts() + 1);
            m.setSentViaDevice(deviceId);
            // stay QUEUED until phone reports SENT; attempts guards poison pills
            if (m.getAttempts() > 5) {
                m.setStatus(SmsMessage.Status.FAILED);
                m.setError("Too many attempts without device confirmation");
            }
        }
        smsRepo.saveAll(batch);
        return batch.stream().filter(m -> m.getStatus() == SmsMessage.Status.QUEUED).toList();
    }

    public SmsMessage report(Long id, String status, String error, String deviceId) {
        SmsMessage m = smsRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("SMS id not found: " + id));
        touchDevice(deviceId, null);
        switch (status == null ? "" : status.toUpperCase()) {
            case "SENT" -> {
                m.setStatus(SmsMessage.Status.SENT);
                m.setSentAt(LocalDateTime.now());
            }
            case "DELIVERED" -> {
                m.setStatus(SmsMessage.Status.DELIVERED);
                m.setDeliveredAt(LocalDateTime.now());
                if (m.getSentAt() == null) m.setSentAt(LocalDateTime.now());
            }
            case "FAILED" -> {
                m.setStatus(SmsMessage.Status.FAILED);
                m.setError(error);
            }
            default -> throw new IllegalArgumentException("status must be SENT|DELIVERED|FAILED");
        }
        if (deviceId != null) m.setSentViaDevice(deviceId);
        return smsRepo.save(m);
    }

    public SmsGatewayDevice register(String deviceId, String name, String simNumber, String apiKey) {
        checkApiKey(apiKey);
        SmsGatewayDevice d = deviceRepo.findById(deviceId).orElseGet(SmsGatewayDevice::new);
        d.setDeviceId(deviceId);
        if (name != null) d.setName(name);
        if (simNumber != null) d.setSimNumber(simNumber);
        d.setActive(true);
        d.setLastSeen(LocalDateTime.now());
        return deviceRepo.save(d);
    }

    public Map<String, Object> stats() {
        Map<String, Object> s = new HashMap<>();
        s.put("queued", smsRepo.countByStatus(SmsMessage.Status.QUEUED));
        s.put("sent", smsRepo.countByStatus(SmsMessage.Status.SENT));
        s.put("delivered", smsRepo.countByStatus(SmsMessage.Status.DELIVERED));
        s.put("failed", smsRepo.countByStatus(SmsMessage.Status.FAILED));
        s.put("devices", deviceRepo.count());
        s.put("freeRoute", true);
        s.put("costPerSms", 0);
        s.put("note", "Own-SIM gateway: cost is SIM recharge only. Keep promo <200/day/SIM.");
        return s;
    }

    private void touchDevice(String deviceId, String name) {
        if (deviceId == null || deviceId.isBlank()) return;
        try {
            SmsGatewayDevice d = deviceRepo.findById(deviceId).orElseGet(SmsGatewayDevice::new);
            if (d.getDeviceId() == null) {
                d.setDeviceId(deviceId);
                d.setName(name != null ? name : deviceId);
                d.setRegisteredAt(LocalDateTime.now());
            }
            d.setLastSeen(LocalDateTime.now());
            d.setActive(true);
            deviceRepo.save(d);
        } catch (Exception ignored) { }
    }

    private void checkApiKey(String provided) {
        if (gatewayApiKey != null && !gatewayApiKey.isBlank()) {
            if (provided == null || !provided.equals(gatewayApiKey)) {
                throw new SecurityException("Invalid gateway api key");
            }
        }
    }

    public String normalize(String phone) {
        if (phone == null) return "";
        String d = phone.replaceAll("[^0-9]", "");
        if (d.length() == 10) d = "91" + d;
        return d;
    }
}
