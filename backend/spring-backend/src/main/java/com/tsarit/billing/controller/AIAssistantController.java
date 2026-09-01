package com.tsarit.billing.controller;

import com.tsarit.billing.service.AIAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-assistant")
@CrossOrigin(origins = "*")
public class AIAssistantController {

    @Autowired
    private AIAssistantService aiAssistantService;

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> queryAssistant(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String userId = payload.get("userId");
        return ResponseEntity.ok(aiAssistantService.askAssistant(query, userId));
    }
}
