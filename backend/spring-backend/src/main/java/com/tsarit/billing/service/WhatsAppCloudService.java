package com.tsarit.billing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;
import java.util.logging.Logger;

/**
 * Real WhatsApp Business Cloud API client (graph.facebook.com/v21.0).
 *
 * Credentials come from the environment (set on the cloud server):
 *   WHATSAPP_ACCESS_TOKEN        - permanent System User token with whatsapp_business_messaging
 *   WHATSAPP_PHONE_NUMBER_ID     - ID of the registered sender number (7893328596)
 *   WHATSAPP_BUSINESS_ACCOUNT_ID - WABA id (optional, used for template listing/health)
 *   WHATSAPP_VERIFY_TOKEN        - arbitrary secret used for Meta webhook handshake
 *
 * If credentials are missing the service fails gracefully (success=false, configured=false)
 * so OTP/login flows never break — they just log the reason.
 */
@Service
public class WhatsAppCloudService {

    private static final Logger log = Logger.getLogger(WhatsAppCloudService.class.getName());

    private static final String GRAPH_BASE = "https://graph.facebook.com/v21.0";

    @Value("${whatsapp.access-token:}")
    private String accessToken;

    @Value("${whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.business-account-id:}")
    private String businessAccountId;

    @Value("${whatsapp.verify-token:tsarit-billing-webhook}")
    private String verifyToken;

    @Value("${whatsapp.otp-template:}")
    private String otpTemplateName;

    @Value("${whatsapp.otp-template-lang:en_US}")
    private String otpTemplateLang;

    @Value("${whatsapp.default-country-code:91}")
    private String defaultCountryCode;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return accessToken != null && !accessToken.isBlank()
                && phoneNumberId != null && !phoneNumberId.isBlank();
    }

    public Map<String, Object> status() {
        Map<String, Object> s = new HashMap<>();
        s.put("configured", isConfigured());
        s.put("phoneNumberId", phoneNumberId == null ? "" : phoneNumberId);
        s.put("businessAccountId", businessAccountId == null ? "" : businessAccountId);
        s.put("verifyTokenSet", verifyToken != null && !verifyToken.isBlank());
        s.put("otpTemplate", otpTemplateName == null ? "" : otpTemplateName);
        return s;
    }

    /** Normalize a phone to E.164 digits with country code (default India 91). */
    public String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("00")) digits = digits.substring(2);
        if (digits.length() == 10) digits = defaultCountryCode + digits;
        return digits;
    }

    /**
     * Send a free-form text message. Only works inside the 24h customer service window
     * (i.e. the user messaged us first). For outbound-first messaging use sendTemplate().
     */
    public Map<String, Object> sendText(String phone, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("recipient_type", "individual");
        body.put("to", normalizePhone(phone));
        body.put("type", "text");
        body.put("text", Map.of("preview_url", true, "body", message));
        return postMessage(body);
    }

    /**
     * Send an OTP. Uses a pre-approved template ({{1}} = code) when configured,
     * otherwise falls back to a plain text message which only works if the
     * recipient messaged the business within the last 24 hours.
     */
    public Map<String, Object> sendOtp(String phone, String otp) {
        String to = normalizePhone(phone);        if (otpTemplateName != null && !otpTemplateName.isBlank()) {
            // Auth templates with a Copy Code / One-Time Password button require the
            // button parameter too, otherwise Graph rejects with (#100) Invalid parameter.
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("recipient_type", "individual");
            body.put("to", to);
            body.put("type", "template");
            body.put("template", Map.of(
                    "name", otpTemplateName,
                    "language", Map.of("code", otpTemplateLang == null ? "en_US" : otpTemplateLang),
                    "components", List.of(
                            Map.of("type", "body", "parameters",
                                    List.of(Map.of("type", "text", "text", otp))),
                            Map.of("type", "button", "sub_type", "url", "index", "0",
                                    "parameters", List.of(Map.of("type", "text", "text", otp))))
                    ));
            return postMessage(body);
        }
        String text = "🔐 " + otp + " is your verification code for All In One Bill. "
                + "Do not share this code with anyone.";
        return sendText(to, text);
    }

    /**
     * Send a generic template message. components may be omitted for templates
     * without variables.
     */
    public Map<String, Object> sendTemplate(String phone, String templateName, String langCode,
                                            List<Map<String, Object>> components) {
        Map<String, Object> template = new LinkedHashMap<>();
        template.put("name", templateName);
        template.put("language", Map.of("code", langCode == null ? "en" : langCode));
        if (components != null && !components.isEmpty()) {
            template.put("components", components);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("recipient_type", "individual");
        body.put("to", normalizePhone(phone));
        body.put("type", "template");
        body.put("template", template);
        return postMessage(body);
    }

    /** List approved message templates on the WABA (diagnostics). */
    public Map<String, Object> listTemplates() {
        Map<String, Object> result = new HashMap<>();
        if (!isConfigured() || businessAccountId == null || businessAccountId.isBlank()) {
            result.put("success", false);
            result.put("error", "WhatsApp not configured (token / WABA id missing)");
            return result;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                    GRAPH_BASE + "/" + businessAccountId + "/message_templates?limit=50",
                    HttpMethod.GET, entity, String.class);
            JsonNode node = objectMapper.readTree(resp.getBody());
            List<Map<String, Object>> templates = new ArrayList<>();
            for (JsonNode t : node.path("data")) {
                Map<String, Object> m = new HashMap<>();
                m.put("name", t.path("name").asText());
                m.put("status", t.path("status").asText());
                m.put("language", t.path("language").asText());
                m.put("category", t.path("category").asText());
                templates.add(m);
            }
            result.put("success", true);
            result.put("templates", templates);
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    /** Fetch the registered phone number info (display name + verified status). */
    public Map<String, Object> phoneNumberInfo() {
        Map<String, Object> result = new HashMap<>();
        if (!isConfigured()) {
            result.put("success", false);
            result.put("error", "WhatsApp not configured");
            return result;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                    GRAPH_BASE + "/" + phoneNumberId
                            + "?fields=display_phone_number,verified_name,quality_rating,code_verification_status",
                    HttpMethod.GET, entity, String.class);
            result.put("success", true);
            result.put("number", objectMapper.readTree(resp.getBody()));
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    private Map<String, Object> postMessage(Map<String, Object> body) {
        Map<String, Object> result = new HashMap<>();
        if (!isConfigured()) {
            result.put("success", false);
            result.put("configured", false);
            result.put("error", "WhatsApp Cloud API not configured: set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID");
            log.warning("[WHATSAPP] Not configured — message to " + body.get("to") + " skipped");
            return result;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> resp = restTemplate.exchange(
                    GRAPH_BASE + "/" + phoneNumberId + "/messages",
                    HttpMethod.POST, entity, String.class);

            JsonNode node = objectMapper.readTree(resp.getBody());
            boolean ok = node.has("messages");
            result.put("success", ok);
            result.put("configured", true);
            if (ok) {
                result.put("messageId", node.path("messages").get(0).path("id").asText());
                result.put("status", "SENT");
                result.put("to", body.get("to"));
                log.info("[WHATSAPP] Message sent to " + body.get("to") + " id=" + result.get("messageId"));
            } else {
                result.put("error", node.path("error").path("message").asText("Unknown Graph API error"));
                log.warning("[WHATSAPP] Graph API error: " + resp.getBody());
            }
            return result;
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            String respBody = e.getResponseBodyAsString();
            result.put("success", false);
            result.put("configured", true);
            result.put("httpStatus", e.getStatusCode().value());
            try {
                JsonNode node = objectMapper.readTree(respBody);
                result.put("error", node.path("error").path("message").asText(respBody));
                result.put("errorCode", node.path("error").path("code").asInt(0));
            } catch (Exception parse) {
                result.put("error", respBody);
            }
            log.warning("[WHATSAPP] HTTP " + e.getStatusCode() + ": " + respBody);
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("configured", true);
            result.put("error", e.getMessage());
            log.warning("[WHATSAPP] Send failed: " + e.getMessage());
            return result;
        }
    }
}
