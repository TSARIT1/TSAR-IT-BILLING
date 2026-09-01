package com.tsarit.billing.controller;

import com.tsarit.billing.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Send single email notification
    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String subject = request.get("subject");
        String body = request.get("body");

        if (to == null || subject == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient (to) and subject are required"));
        }

        return ResponseEntity.ok(notificationService.sendEmail(to, subject, body));
    }

    // Generate instant WhatsApp message and web link for an invoice
    @PostMapping("/whatsapp/invoice/{invoiceId}")
    public ResponseEntity<?> sendInvoiceWhatsApp(
            @PathVariable String invoiceId,
            @RequestBody(required = false) Map<String, String> body) {
        String phone = body != null ? body.get("phone") : null;
        return ResponseEntity.ok(notificationService.generateInvoiceWhatsApp(invoiceId, phone));
    }

    // Dispatch SMS / WhatsApp campaign
    @PostMapping("/campaign/send")
    public ResponseEntity<?> sendCampaign(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String category = request.get("category");
        String message = request.get("message");
        String audience = request.get("audience");
        String businessId = request.get("businessId");

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message content cannot be empty"));
        }

        return ResponseEntity.ok(notificationService.sendCampaign(title, category, message, audience, businessId));
    }

    // Get campaign history and delivery analytics
    @GetMapping("/campaign/stats")
    public ResponseEntity<?> getCampaignStats() {
        return ResponseEntity.ok(notificationService.getCampaignStats());
    }
}
