package com.tsarit.billing.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tsarit.billing.model.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class KafkaNotificationService {

    private static final Logger log = LoggerFactory.getLogger(KafkaNotificationService.class);
    public static final String TOPIC_NOTIFICATIONS = "billing-notifications";
    public static final String TOPIC_INVOICES = "billing-invoices";
    public static final String TOPIC_AUDIT = "billing-audit";

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private SseEmitterService sseEmitterService;

    @Value("${kafka.notifications.enabled:true}")
    private boolean kafkaEnabled;

    private final ObjectMapper objectMapper;

    public KafkaNotificationService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Publish notification to Kafka asynchronously with graceful fallback
     */
    public void publishNotification(Notification notification) {
        if (!kafkaEnabled || kafkaTemplate == null) {
            log.debug("Kafka template not active, direct push to SSE");
            sseEmitterService.dispatchNotification(notification);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(notification);
            String key = notification.getBusinessId() != null ? notification.getBusinessId() : "GLOBAL";

            kafkaTemplate.send(TOPIC_NOTIFICATIONS, key, json)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.warn("Kafka publish failed for notif {}: {}. Falling back to direct SSE push.",
                                    notification.getId(), ex.getMessage());
                            sseEmitterService.dispatchNotification(notification);
                        } else {
                            log.info("Notification {} published to Kafka topic {} partition {}",
                                    notification.getId(), TOPIC_NOTIFICATIONS,
                                    result.getRecordMetadata().partition());
                            // Also deliver to local connected SSE emitters
                            sseEmitterService.dispatchNotification(notification);
                        }
                    });
        } catch (Exception e) {
            log.warn("Error serializing notification for Kafka: {}. Fallback to direct SSE.", e.getMessage());
            sseEmitterService.dispatchNotification(notification);
        }
    }

    /**
     * Publish business audit event to Kafka
     */
    public void publishAudit(String action, String businessId, String userId, Map<String, Object> details) {
        if (!kafkaEnabled || kafkaTemplate == null) return;
        try {
            Map<String, Object> payload = Map.of(
                    "action", action,
                    "businessId", businessId != null ? businessId : "",
                    "userId", userId != null ? userId : "",
                    "details", details != null ? details : Map.of(),
                    "timestamp", System.currentTimeMillis()
            );
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(TOPIC_AUDIT, businessId != null ? businessId : "GLOBAL", json);
        } catch (Exception e) {
            log.debug("Failed to publish audit to Kafka: {}", e.getMessage());
        }
    }

    /**
     * Consume notification messages from Kafka topic
     */
    @KafkaListener(topics = TOPIC_NOTIFICATIONS, groupId = "tsar-billing-portal", autoStartup = "${spring.kafka.consumer.auto-startup:true}")
    public void consumeNotification(String message) {
        try {
            Notification notification = objectMapper.readValue(message, Notification.class);
            log.info("Received notification from Kafka: [{}] {}", notification.getType(), notification.getTitle());
            sseEmitterService.dispatchNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to parse Kafka notification message: {}", e.getMessage());
        }
    }

    public boolean isKafkaConnected() {
        if (!kafkaEnabled || kafkaTemplate == null) return false;
        try {
            return kafkaTemplate.getProducerFactory() != null;
        } catch (Exception e) {
            return false;
        }
    }
}
