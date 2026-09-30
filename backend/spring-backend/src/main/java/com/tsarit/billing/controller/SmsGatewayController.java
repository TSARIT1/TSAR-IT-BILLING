package com.tsarit.billing.controller;

import com.tsarit.billing.model.SmsMessage;
import com.tsarit.billing.service.SmsGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sms-gateway")
@CrossOrigin(originPatterns = "*")
public class SmsGatewayController {

    @Autowired
    private SmsGatewayService gateway;

    // App/backend enqueue a single free SMS (OTP / reminder)
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody Map<String, String> req) {
        try {
            String to = req.get("to");
            String text = req.get("text");
            String kindStr = req.getOrDefault("kind", "TRANSACTIONAL");
            SmsMessage.Kind kind;
            try {
                kind = SmsMessage.Kind.valueOf(kindStr.toUpperCase());
            } catch (Exception e) {
                kind = SmsMessage.Kind.TRANSACTIONAL;
            }
            SmsMessage m = gateway.enqueue(to, text, kind, req.get("businessId"));
            return ResponseEntity.ok(Map.of("success", true, "id", m.getId(), "status", m.getStatus().name(),
                    "via", "OWN-SIM-GATEWAY", "cost", 0));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Bulk enqueue (campaigns). Body: { phones: [...], text, kind, businessId }
    @PostMapping("/send-bulk")
    public ResponseEntity<?> sendBulk(@RequestBody Map<String, Object> req) {
        Object phonesObj = req.get("phones");
        List<String> phones = phonesObj instanceof List<?> l
                ? l.stream().map(Object::toString).toList()
                : List.of();
        String text = (String) req.get("text");
        if (phones.isEmpty() || text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "phones[] and text are required"));
        }
        SmsMessage.Kind kind = SmsMessage.Kind.PROMOTIONAL;
        try {
            if (req.get("kind") != null) kind = SmsMessage.Kind.valueOf(req.get("kind").toString().toUpperCase());
        } catch (Exception ignored) { }
        var queued = gateway.enqueueBulk(phones, text, kind, (String) req.get("businessId"));
        return ResponseEntity.ok(Map.of("success", true, "queued", queued.size(), "via", "OWN-SIM-GATEWAY", "cost", 0));
    }

    // Gateway phone registration (one-time per SIM phone)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        try {
            var d = gateway.register(req.get("deviceId"), req.get("name"), req.get("simNumber"), req.get("apiKey"));
            return ResponseEntity.ok(Map.of("success", true, "deviceId", d.getDeviceId(), "active", d.isActive()));
        } catch (SecurityException e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // Gateway phone long-polls for work: GET /api/sms-gateway/poll?deviceId=SHOP-PHONE-1&limit=10
    @GetMapping("/poll")
    public ResponseEntity<?> poll(@RequestParam String deviceId,
                                  @RequestParam(required = false, defaultValue = "10") int limit) {
        var batch = gateway.poll(deviceId, limit);
        var items = batch.stream().map(m -> Map.of(
                "id", m.getId(),
                "to", m.getToPhone(),
                "text", m.getText(),
                "kind", m.getKind().name()
        )).toList();
        return ResponseEntity.ok(Map.of("success", true, "messages", items, "count", items.size()));
    }

    // Gateway phone reports result: { id, status: SENT|DELIVERED|FAILED, error?, deviceId }
    @PostMapping("/report")
    public ResponseEntity<?> report(@RequestBody Map<String, Object> req) {
        try {
            Long id = Long.valueOf(req.get("id").toString());
            String status = (String) req.get("status");
            String error = (String) req.get("error");
            String deviceId = (String) req.get("deviceId");
            var m = gateway.report(id, status, error, deviceId);
            return ResponseEntity.ok(Map.of("success", true, "id", m.getId(), "status", m.getStatus().name()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(gateway.stats());
    }
}
