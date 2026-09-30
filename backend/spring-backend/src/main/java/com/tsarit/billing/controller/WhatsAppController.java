package com.tsarit.billing.controller;

import com.tsarit.billing.service.WhatsAppCloudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * WhatsApp Business Cloud API webhook + messaging endpoints.
 *
 * Webhook callback URL to configure in Meta App Dashboard:
 *   https://billing.tsaritservices.com/api/whatsapp/webhook
 * Verify token must match WHATSAPP_VERIFY_TOKEN on the server.
 */
@RestController
@RequestMapping("/api/whatsapp")
@CrossOrigin(originPatterns = "*")
public class WhatsAppController {

    @Autowired
    private WhatsAppCloudService whatsapp;

    @Value("${whatsapp.verify-token:tsarit-billing-webhook}")
    private String verifyToken;

    // ---------- Webhook verification handshake (Meta calls this once) ----------
    @GetMapping("/webhook")
    public ResponseEntity<?> verifyWebhook(
            @RequestParam(value = "hub.mode", required = false) String mode,
            @RequestParam(value = "hub.verify_token", required = false) String token,
            @RequestParam(value = "hub.challenge", required = false) String challenge) {

        if ("subscribe".equals(mode) && verifyToken != null && verifyToken.equals(token)) {
            return ResponseEntity.ok(challenge == null ? "" : challenge);
        }
        return ResponseEntity.status(403).body(Map.of("error", "Webhook verification failed"));
    }

    // ---------- Inbound events: messages + delivery statuses ----------
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> receiveWebhook(@RequestBody Map<String, Object> payload) {
        try {
            Object entryObj = payload.get("entry");
            if (entryObj instanceof List<?> entries) {
                for (Object e : entries) {
                    if (!(e instanceof Map<?, ?> entry)) continue;
                    Object changesObj = entry.get("changes");
                    if (!(changesObj instanceof List<?> changes)) continue;
                    for (Object c : changes) {
                        if (!(c instanceof Map<?, ?> change)) continue;
                        Object valueObj = ((Map<?, ?>) change).get("value");
                        if (!(valueObj instanceof Map<?, ?> value)) continue;

                        Object messagesObj = value.get("messages");
                        if (messagesObj instanceof List<?> messages) {
                            for (Object m : messages) {
                                if (m instanceof Map<?, ?> msg) {
                                    String from = String.valueOf(((Map<?, ?>) msg).get("from"));
                                    Object textObj = ((Map<?, ?>) msg).get("text");
                                    String body = "";
                                    if (textObj instanceof Map<?, ?> t) {
                                        body = String.valueOf(t.get("body"));
                                    }
                                    System.out.println("[WHATSAPP INBOUND] from=" + from + " body=" + body);
                                    // TODO: route to bot/auto-responder if desired
                                }
                            }
                        }
                        Object statusesObj = value.get("statuses");
                        if (statusesObj instanceof List<?> statuses) {
                            for (Object s : statuses) {
                                if (s instanceof Map<?, ?> st) {
                                    System.out.println("[WHATSAPP STATUS] " + st.get("id")
                                            + " -> " + st.get("status"));
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Always 200 so Meta does not disable the webhook
            System.out.println("[WHATSAPP WEBHOOK] parse error: " + e.getMessage());
        }
        return ResponseEntity.ok(Map.of("received", true));
    }

    // ---------- Status / diagnostics ----------
    @GetMapping("/status")
    public Map<String, Object> status() {
        return whatsapp.status();
    }

    @GetMapping("/number")
    public Map<String, Object> numberInfo() {
        return whatsapp.phoneNumberInfo();
    }

    @GetMapping("/templates")
    public Map<String, Object> templates() {
        return whatsapp.listTemplates();
    }

    // ---------- Messaging ----------
    public record SendRequest(String phone, String message) {}

    public record OtpRequest(String phone, String otp) {}

    public record TemplateRequest(String phone, String template, String language,
                                  List<Map<String, Object>> components) {}

    @PostMapping("/send")
    public Map<String, Object> send(@RequestBody SendRequest req) {
        if (req.phone() == null || req.message() == null || req.message().isBlank()) {
            return Map.of("success", false, "error", "phone and message are required");
        }
        return whatsapp.sendText(req.phone(), req.message());
    }

    @PostMapping("/otp/send")
    public Map<String, Object> sendOtp(@RequestBody OtpRequest req) {
        if (req.phone() == null || req.otp() == null || req.otp().isBlank()) {
            return Map.of("success", false, "error", "phone and otp are required");
        }
        return whatsapp.sendOtp(req.phone(), req.otp());
    }

    @PostMapping("/template/send")
    public Map<String, Object> sendTemplate(@RequestBody TemplateRequest req) {
        if (req.phone() == null || req.template() == null) {
            return Map.of("success", false, "error", "phone and template are required");
        }
        return whatsapp.sendTemplate(req.phone(), req.template(), req.language(), req.components());
    }
}
