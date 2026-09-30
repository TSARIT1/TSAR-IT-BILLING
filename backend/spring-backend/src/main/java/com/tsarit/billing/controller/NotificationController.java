package com.tsarit.billing.controller;

import com.tsarit.billing.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.tsarit.billing.repository.UserBusinessRepository userBusinessRepository;

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

    // Broadcast portal notification (Super Admin only — enforced)
    @PostMapping("/portal/broadcast")
    public ResponseEntity<?> broadcastPortalNotification(@RequestBody Map<String, String> request) {
        // Authorization: caller must hold a SUPER_ADMIN membership
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof com.tsarit.billing.model.User caller)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        boolean isSuper = userBusinessRepository.findByUserId(caller.getId()).stream()
                .anyMatch(ub -> ub.getRole() == com.tsarit.billing.model.UserRole.SUPER_ADMIN);
        if (!isSuper) {
            return ResponseEntity.status(403).body(Map.of("error", "SUPER_ADMIN role required"));
        }

        String title = request.get("title");
        String message = request.get("message");
        String type = request.get("type");
        String target = request.get("target");

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Notification message cannot be empty"));
        }

        return ResponseEntity.ok(notificationService.broadcastPortalNotification(title, message, type, target));
    }

    // Get notifications for portal header / tenant
    @GetMapping("/portal/user")
    public ResponseEntity<?> getPortalNotifications(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {
        return ResponseEntity.ok(notificationService.getPortalNotifications(userId, businessId));
    }

    // Mark single notification read
    @PutMapping("/portal/{notifId}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable String notifId) {
        return ResponseEntity.ok(notificationService.markNotificationRead(notifId));
    }

    // Mark all notifications read
    @PutMapping("/portal/read-all")
    public ResponseEntity<?> markAllNotificationsRead(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {
        return ResponseEntity.ok(notificationService.markAllNotificationsRead(userId, businessId));
    }
}
