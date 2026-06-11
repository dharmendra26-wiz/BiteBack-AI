package com.vesta.vestaai.controller;

import com.vesta.vestaai.model.SurplusItem;
import com.vesta.vestaai.model.User;
import com.vesta.vestaai.repository.SurplusItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/surplus")
public class SurplusController {

    private final SurplusItemRepository surplusItemRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public SurplusController(SurplusItemRepository surplusItemRepository, SimpMessagingTemplate messagingTemplate) {
        this.surplusItemRepository = surplusItemRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public List<SurplusItem> getAvailable(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank())
            return surplusItemRepository.findByStatusAndCategory(SurplusItem.Status.AVAILABLE, category);
        return surplusItemRepository.findAllAvailableOrderByExpiry();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurplusItem> getById(@PathVariable Long id) {
        return surplusItemRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyListings(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(surplusItemRepository.findByShop(user));
    }

    @PostMapping
    public ResponseEntity<?> createListing(@RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        if (user.getRole() != User.Role.SHOP)
            return ResponseEntity.status(403).body(Map.of("error", "Only shops can create listings"));

        SurplusItem item = SurplusItem.builder()
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .imageUrl((String) body.get("imageUrl"))
                .originalPrice(((Number) body.get("originalPrice")).doubleValue())
                .discountedPrice(((Number) body.get("discountedPrice")).doubleValue())
                .quantity(((Number) body.get("quantity")).intValue())
                .category((String) body.get("category"))
                .dietaryTags((String) body.getOrDefault("dietaryTags", ""))
                .shop(user)
                .expiresAt(LocalDateTime.parse((String) body.get("expiresAt")))
                .co2Saved(((Number) body.getOrDefault("co2Saved", 0.5)).doubleValue())
                .build();

        SurplusItem saved = surplusItemRepository.save(item);

        messagingTemplate.convertAndSend("/topic/new-surplus", Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "shopName", user.getBusinessName() != null ? user.getBusinessName() : user.getUsername(),
                "category", saved.getCategory() != null ? saved.getCategory() : "",
                "dietaryTags", saved.getDietaryTags() != null ? saved.getDietaryTags() : "",
                "discountedPrice", saved.getDiscountedPrice()
        ));

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateListing(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return surplusItemRepository.findById(id).map(item -> {
            if (!item.getShop().getId().equals(user.getId()))
                return ResponseEntity.status(403).<SurplusItem>build();
            if (body.containsKey("title")) item.setTitle((String) body.get("title"));
            if (body.containsKey("discountedPrice")) item.setDiscountedPrice(((Number) body.get("discountedPrice")).doubleValue());
            if (body.containsKey("quantity")) item.setQuantity(((Number) body.get("quantity")).intValue());
            if (body.containsKey("status")) item.setStatus(SurplusItem.Status.valueOf((String) body.get("status")));
            return ResponseEntity.ok(surplusItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return surplusItemRepository.findById(id).map(item -> {
            if (!item.getShop().getId().equals(user.getId()))
                return ResponseEntity.status(403).body(Map.of("error", "Not your listing"));
            surplusItemRepository.delete(item);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
