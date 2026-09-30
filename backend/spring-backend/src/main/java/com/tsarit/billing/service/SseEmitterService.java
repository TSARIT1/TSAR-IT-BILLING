package com.tsarit.billing.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tsarit.billing.model.Notification;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@EnableScheduling
public class SseEmitterService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map businessId -> list of active emitters
    // Special key "GLOBAL" or empty for global listeners (e.g. super admin)
    private final Map<String, List<ClientEmitter>> clientEmitters = new ConcurrentHashMap<>();

    public static class ClientEmitter {
        private final String emitterId;
        private final String businessId;
        private final String userId;
        private final SseEmitter emitter;

        public ClientEmitter(String emitterId, String businessId, String userId, SseEmitter emitter) {
            this.emitterId = emitterId;
            this.businessId = businessId != null ? businessId : "";
            this.userId = userId != null ? userId : "";
            this.emitter = emitter;
        }

        public String getEmitterId() { return emitterId; }
        public String getBusinessId() { return businessId; }
        public String getUserId() { return userId; }
        public SseEmitter getEmitter() { return emitter; }
    }

    public SseEmitter createEmitter(String businessId, String userId) {
        // 30-minute timeout
        SseEmitter emitter = new SseEmitter(1800000L);
        String emitterId = UUID.randomUUID().toString();
        ClientEmitter client = new ClientEmitter(emitterId, businessId, userId, emitter);

        String key = (businessId != null && !businessId.isBlank()) ? businessId : "GLOBAL";
        clientEmitters.computeIfAbsent(key, k -> new CopyOnWriteArrayList<>()).add(client);

        emitter.onCompletion(() -> removeEmitter(key, emitterId));
        emitter.onTimeout(() -> {
            emitter.complete();
            removeEmitter(key, emitterId);
        });
        emitter.onError((e) -> removeEmitter(key, emitterId));

        // Send initial connected event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("status", "connected", "emitterId", emitterId, "timestamp", System.currentTimeMillis())));
        } catch (IOException e) {
            removeEmitter(key, emitterId);
        }

        return emitter;
    }

    private void removeEmitter(String key, String emitterId) {
        List<ClientEmitter> list = clientEmitters.get(key);
        if (list != null) {
            list.removeIf(c -> c.getEmitterId().equals(emitterId));
            if (list.isEmpty()) {
                clientEmitters.remove(key);
            }
        }
    }

    public void dispatchNotification(Notification notification) {
        if (notification == null) return;

        String targetBiz = notification.getBusinessId();
        String targetUser = notification.getUserId();

        List<ClientEmitter> recipients = new ArrayList<>();

        if (targetBiz == null || targetBiz.isBlank() || "ALL".equalsIgnoreCase(targetBiz)) {
            // Broadcast to everyone
            for (List<ClientEmitter> list : clientEmitters.values()) {
                recipients.addAll(list);
            }
        } else {
            // Direct to target business + also any GLOBAL/Super admin connections
            List<ClientEmitter> bizList = clientEmitters.get(targetBiz);
            if (bizList != null) {
                recipients.addAll(bizList);
            }
            List<ClientEmitter> globalList = clientEmitters.get("GLOBAL");
            if (globalList != null) {
                recipients.addAll(globalList);
            }
        }

        for (ClientEmitter client : recipients) {
            // Filter by userId if specified and not ALL
            if (targetUser != null && !targetUser.isBlank() && !"ALL".equalsIgnoreCase(targetUser)) {
                if (!targetUser.equalsIgnoreCase(client.getUserId())) {
                    continue;
                }
            }

            try {
                client.getEmitter().send(SseEmitter.event()
                        .name("notification")
                        .id(notification.getId())
                        .data(notification));
            } catch (Exception e) {
                removeEmitter((client.getBusinessId().isEmpty() ? "GLOBAL" : client.getBusinessId()), client.getEmitterId());
            }
        }
    }

    // Keep alive heartbeat every 20 seconds to prevent reverse proxy/nginx 504 timeouts
    @Scheduled(fixedRate = 20000)
    public void sendHeartbeat() {
        for (Map.Entry<String, List<ClientEmitter>> entry : clientEmitters.entrySet()) {
            for (ClientEmitter client : entry.getValue()) {
                try {
                    client.getEmitter().send(SseEmitter.event()
                            .name("ping")
                            .data(Map.of("ping", System.currentTimeMillis())));
                } catch (Exception e) {
                    removeEmitter(entry.getKey(), client.getEmitterId());
                }
            }
        }
    }
}
