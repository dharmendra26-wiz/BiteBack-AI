package com.vesta.vestaai.controller;

import com.vesta.vestaai.model.Donation;
import com.vesta.vestaai.model.SurplusItem;
import com.vesta.vestaai.model.User;
import com.vesta.vestaai.repository.DonationRepository;
import com.vesta.vestaai.repository.SurplusItemRepository;
import com.vesta.vestaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationRepository donationRepository;
    private final SurplusItemRepository surplusItemRepository;
    private final UserRepository userRepository;

    @Autowired
    public DonationController(DonationRepository donationRepository,
                               SurplusItemRepository surplusItemRepository,
                               UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.surplusItemRepository = surplusItemRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> donate(@RequestBody Map<String, Object> body,
                                    @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();

        Long itemId = ((Number) body.get("surplusItemId")).longValue();
        Long foodBankId = ((Number) body.get("foodBankId")).longValue();
        int qty = ((Number) body.get("quantity")).intValue();
        String notes = (String) body.getOrDefault("notes", "");

        SurplusItem item = surplusItemRepository.findById(itemId).orElse(null);
        User foodBank = userRepository.findById(foodBankId).orElse(null);

        if (item == null || foodBank == null) return ResponseEntity.notFound().build();
        if (foodBank.getRole() != User.Role.FOOD_BANK)
            return ResponseEntity.badRequest().body(Map.of("error", "Target must be a food bank"));

        item.setStatus(SurplusItem.Status.DONATED);
        surplusItemRepository.save(item);

        Donation donation = Donation.builder()
                .surplusItem(item).foodBank(foodBank)
                .quantityDonated(qty).notes(notes).build();

        return ResponseEntity.ok(donationRepository.save(donation));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyDonations(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        if (user.getRole() == User.Role.FOOD_BANK)
            return ResponseEntity.ok(donationRepository.findByFoodBank(user));
        return ResponseEntity.ok(donationRepository.findBySurplusItemShop(user));
    }

    @GetMapping("/foodbanks")
    public ResponseEntity<List<User>> getFoodBanks() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.FOOD_BANK));
    }
}
