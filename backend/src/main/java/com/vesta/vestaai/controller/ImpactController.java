package com.vesta.vestaai.controller;

import com.vesta.vestaai.model.User;
import com.vesta.vestaai.repository.ImpactRecordRepository;
import com.vesta.vestaai.repository.SurplusItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    private final ImpactRecordRepository impactRecordRepository;
    private final SurplusItemRepository surplusItemRepository;

    @Autowired
    public ImpactController(ImpactRecordRepository impactRecordRepository,
                             SurplusItemRepository surplusItemRepository) {
        this.impactRecordRepository = impactRecordRepository;
        this.surplusItemRepository = surplusItemRepository;
    }

    @GetMapping("/global")
    public ResponseEntity<?> getGlobalImpact() {
        Double co2 = impactRecordRepository.getGlobalCo2Saved();
        Integer meals = impactRecordRepository.getGlobalMealsSaved();
        return ResponseEntity.ok(Map.of(
                "co2Saved", co2 != null ? co2 : 0.0,
                "mealsSaved", meals != null ? meals : 0
        ));
    }

    @GetMapping("/shop")
    public ResponseEntity<?> getMyImpact(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        Double co2 = impactRecordRepository.getShopCo2Saved(user);
        Integer meals = impactRecordRepository.getShopMealsSaved(user);
        var history = impactRecordRepository.findByShopOrderByDateDesc(user);
        return ResponseEntity.ok(Map.of(
                "co2Saved", co2 != null ? co2 : 0.0,
                "mealsSaved", meals != null ? meals : 0,
                "history", history
        ));
    }
}
