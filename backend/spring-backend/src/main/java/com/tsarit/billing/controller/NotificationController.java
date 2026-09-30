package com.tsarit.billing.controller;

import com.tsarit.billing.model.Notification;
import com.tsarit.billing.model.NotificationSetting;
import com.tsarit.billing.model.User;
import com.tsarit.billing.model.UserRole;
import com.tsarit.billing.repository.UserBusinessRepository;
import com.tsarit.billing.service.NotificationService;
import com.tsarit.billing.service.SseEmitterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SseEmitterService sseEmitterService;

    @Autowired
    private UserBusinessRepository userBusinessRepository;

    private boolean isSuperAdmin(User caller) {
        if (caller == null) return false;
        return userBusinessRepository.findByUserId(caller.getId()).stream()
                .anyMatch(ub -> ub.getRole() == UserRole.SUPER_ADMIN);
    }

    private User getCaller() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User caller) {
            return caller;
        }
        return null;
    }

    // =========================================================================
    // Real-Time Server-Sent Events (SSE) Stream
    // =========================================================================

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) String userId) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        return sseEmitterService.createEmitter(businessId, effectiveUserId);
    }

    // =========================================================================
    // Fetch Notifications & Unread Counts
    // =========================================================================

    @GetMapping("")
    public ResponseEntity<?> getNotifications(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        List<Notification> list = notificationService.getNotifications(effectiveUserId, businessId, limit);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/portal/user")
    public ResponseEntity<?> getPortalNotifications(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        return ResponseEntity.ok(notificationService.getPortalNotifications(effectiveUserId, businessId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        long count = notificationService.getUnreadCount(effectiveUserId, businessId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{notifId}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable String notifId) {
        boolean ok = notificationService.markNotificationRead(notifId);
        return ResponseEntity.ok(Map.of("success", ok, "markedId", notifId));
    }

    @PutMapping("/portal/{notifId}/read")
    public ResponseEntity<?> markPortalNotificationRead(@PathVariable String notifId) {
        boolean ok = notificationService.markNotificationRead(notifId);
        return ResponseEntity.ok(Map.of("success", ok, "markedId", notifId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllNotificationsRead(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        int updated = notificationService.markAllNotificationsRead(effectiveUserId, businessId);
        return ResponseEntity.ok(Map.of("success", true, "updatedCount", updated));
    }

    @PutMapping("/portal/read-all")
    public ResponseEntity<?> markAllPortalNotificationsRead(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String businessId) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        int updated = notificationService.markAllNotificationsRead(effectiveUserId, businessId);
        return ResponseEntity.ok(Map.of("success", true, "updatedCount", updated));
    }

    @DeleteMapping("/{notifId}")
    public ResponseEntity<?> deleteNotification(@PathVariable String notifId) {
        boolean ok = notificationService.deleteNotification(notifId);
        return ResponseEntity.ok(Map.of("success", ok));
    }

    // =========================================================================
    // Notification Settings
    // =========================================================================

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) String userId) {
        User caller = getCaller();
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId : (caller != null ? caller.getId() : "");
        NotificationSetting setting = notificationService.getOrCreateSettings(businessId, effectiveUserId);
        return ResponseEntity.ok(setting);
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody NotificationSetting setting) {
        NotificationSetting updated = notificationService.updateSettings(setting);
        return ResponseEntity.ok(updated);
    }

    // =========================================================================
    // Super Admin Control & Platform Broadcast
    // =========================================================================

    @PostMapping({"/broadcast", "/portal/broadcast"})
    public ResponseEntity<?> broadcastNotification(@RequestBody Map<String, String> request) {
        User caller = getCaller();
        if (caller == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        if (!isSuperAdmin(caller)) {
            return ResponseEntity.status(403).body(Map.of("error", "SUPER_ADMIN role required"));
        }

        String title = request.get("title");
        String message = request.get("message");
        String type = request.getOrDefault("type", "INFO");
        String target = request.getOrDefault("target", "ALL");
        String actionUrl = request.get("actionUrl");

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Notification message cannot be empty"));
        }

        Notification notif = notificationService.broadcastPlatform(title, message, type, target, actionUrl);
        return ResponseEntity.ok(Map.of("success", true, "notification", notif));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAdminNotifications(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        User caller = getCaller();
        if (caller == null || !isSuperAdmin(caller)) {
            return ResponseEntity.status(403).body(Map.of("error", "SUPER_ADMIN role required"));
        }
        return ResponseEntity.ok(notificationService.getAllNotificationsForAdmin(page, size));
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<?> getAdminAnalytics() {
        User caller = getCaller();
        if (caller == null || !isSuperAdmin(caller)) {
            return ResponseEntity.status(403).body(Map.of("error", "SUPER_ADMIN role required"));
        }
        return ResponseEntity.ok(notificationService.getNotificationAnalytics());
    }

    // =========================================================================
    // Existing Email / WhatsApp / Campaign Endpoints
    // =========================================================================

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

    @PostMapping("/whatsapp/invoice/{invoiceId}")
    public ResponseEntity<?> sendInvoiceWhatsApp(
            @PathVariable String invoiceId,
            @RequestBody(required = false) Map<String, String> body) {
        String phone = body != null ? body.get("phone") : null;
        return ResponseEntity.ok(notificationService.generateInvoiceWhatsApp(invoiceId, phone));
    }

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

    @GetMapping("/campaign/stats")
    public ResponseEntity<?> getCampaignStats() {
        return ResponseEntity.ok(notificationService.getCampaignStats());
    }
}
