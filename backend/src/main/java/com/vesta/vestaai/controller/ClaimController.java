package com.vesta.vestaai.controller;

import com.vesta.vestaai.model.Claim;
import com.vesta.vestaai.model.SurplusItem;
import com.vesta.vestaai.model.User;
import com.vesta.vestaai.repository.ClaimRepository;
import com.vesta.vestaai.repository.SurplusItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimRepository claimRepository;
    private final SurplusItemRepository surplusItemRepository;

    @Autowired
    public ClaimController(ClaimRepository claimRepository, SurplusItemRepository surplusItemRepository) {
        this.claimRepository = claimRepository;
        this.surplusItemRepository = surplusItemRepository;
    }

    @PostMapping
    public ResponseEntity<?> claimItem(@RequestBody Map<String, Object> body,
                                       @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        if (user.getRole() != User.Role.CUSTOMER)
            return ResponseEntity.status(403).body(Map.of("error", "Only customers can claim items"));

        Long itemId = ((Number) body.get("surplusItemId")).longValue();
        int qty = ((Number) body.get("quantity")).intValue();

        return surplusItemRepository.findById(itemId).map(item -> {
            if (item.getStatus() != SurplusItem.Status.AVAILABLE && item.getStatus() != SurplusItem.Status.PARTIALLY_CLAIMED)
                return ResponseEntity.badRequest().body(Map.of("error", "Item is no longer available"));
            if (item.getQuantity() < qty)
                return ResponseEntity.badRequest().body(Map.of("error", "Not enough quantity"));

            int remaining = item.getQuantity() - qty;
            item.setQuantity(remaining);
            item.setStatus(remaining == 0 ? SurplusItem.Status.CLAIMED : SurplusItem.Status.PARTIALLY_CLAIMED);
            surplusItemRepository.save(item);

            Claim claim = Claim.builder()
                    .surplusItem(item).customer(user).quantityClaimed(qty).build();
            return ResponseEntity.ok(claimRepository.save(claim));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyClaims(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(claimRepository.findByCustomer(user));
    }

    @GetMapping("/shop")
    public ResponseEntity<?> getShopClaims(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(claimRepository.findBySurplusItemShop(user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body,
                                          @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return claimRepository.findById(id).map(claim -> {
            claim.setStatus(Claim.Status.valueOf(body.get("status")));
            return ResponseEntity.ok(claimRepository.save(claim));
        }).orElse(ResponseEntity.notFound().build());
    }
}
