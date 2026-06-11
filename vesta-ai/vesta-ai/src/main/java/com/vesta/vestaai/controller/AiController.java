package com.vesta.vestaai.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.vesta.vestaai.model.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Proxy: AI Inventory Scanner
    @PostMapping("/scan")
    public ResponseEntity<?> scanInventory(@RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        if (user.getRole() != User.Role.SHOP) {
            return ResponseEntity.status(403).body(Map.of("error", "Only shops can use the scanner"));
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            return restTemplate.postForEntity(aiServiceUrl + "/scan", request, Object.class);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of("error", "AI service unavailable. " + e.getMessage()));
        }
    }

    // Proxy: AI Price Suggestion
    @PostMapping("/price")
    public ResponseEntity<?> suggestPrice(@RequestBody Map<String, Object> body,
                                          @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            return restTemplate.postForEntity(aiServiceUrl + "/price", request, Object.class);
        } catch (Exception e) {
            // Fallback: suggest 40% off
            double originalPrice = ((Number) body.getOrDefault("originalPrice", 10.0)).doubleValue();
            return ResponseEntity.ok(Map.of(
                    "suggestedPrice", Math.round(originalPrice * 0.6 * 100.0) / 100.0,
                    "discountPct", 40,
                    "reason", "Standard end-of-day 40% discount (AI offline)",
                    "fallback", true
            ));
        }
    }

    // Health
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        try {
            ResponseEntity<Object> resp = restTemplate.getForEntity(aiServiceUrl + "/health", Object.class);
            return ResponseEntity.ok(Map.of("aiService", "online", "status", resp.getStatusCode().value()));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("aiService", "offline", "fallback", "enabled"));
        }
    }
}
