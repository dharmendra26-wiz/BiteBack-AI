package com.vesta.vestaai.vestaai;

import com.vesta.vestaai.model.*;
import com.vesta.vestaai.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final SurplusItemRepository surplusItemRepository;
    private final ImpactRecordRepository impactRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataSeeder(UserRepository userRepository,
                      SurplusItemRepository surplusItemRepository,
                      ImpactRecordRepository impactRecordRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.surplusItemRepository = surplusItemRepository;
        this.impactRecordRepository = impactRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;
        log.info("🌱 Seeding demo data...");

        User shop = userRepository.save(User.builder()
                .username("green_bakery").email("shop@demo.com")
                .password(passwordEncoder.encode("demo123"))
                .role(User.Role.SHOP)
                .businessName("Green Valley Bakery")
                .address("12 Maple Street, London")
                .phone("+44 20 1234 5678").build());

        userRepository.save(User.builder()
                .username("jane_customer").email("customer@demo.com")
                .password(passwordEncoder.encode("demo123"))
                .role(User.Role.CUSTOMER)
                .businessName("").address("").phone("").build());

        userRepository.save(User.builder()
                .username("city_foodbank").email("foodbank@demo.com")
                .password(passwordEncoder.encode("demo123"))
                .role(User.Role.FOOD_BANK)
                .businessName("City Community Food Bank")
                .address("7 Elm Road, London")
                .phone("+44 20 5555 1234").build());

        surplusItemRepository.save(SurplusItem.builder()
                .title("Artisan Sourdough Loaves")
                .description("Freshly baked sourdough, perfect for today. Pack of 3.")
                .imageUrl("https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400")
                .originalPrice(12.00).discountedPrice(4.50).quantity(8)
                .category("Bakery").dietaryTags("Vegan,High-Fibre").shop(shop)
                .expiresAt(LocalDateTime.now().plusHours(4))
                .co2Saved(1.2).status(SurplusItem.Status.AVAILABLE)
                .createdAt(LocalDateTime.now()).build());

        surplusItemRepository.save(SurplusItem.builder()
                .title("Assorted Pastry Box")
                .description("Mix of croissants, danish pastries, and muffins. Box of 6.")
                .imageUrl("https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=400")
                .originalPrice(15.00).discountedPrice(5.00).quantity(4)
                .category("Bakery").dietaryTags("Vegetarian").shop(shop)
                .expiresAt(LocalDateTime.now().plusHours(3))
                .co2Saved(0.8).status(SurplusItem.Status.AVAILABLE)
                .createdAt(LocalDateTime.now()).build());

        surplusItemRepository.save(SurplusItem.builder()
                .title("Organic Veggie Bundle")
                .description("Mixed seasonal vegetables — carrots, broccoli, spinach.")
                .imageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400")
                .originalPrice(8.00).discountedPrice(2.50).quantity(10)
                .category("Produce").dietaryTags("Vegan,Organic").shop(shop)
                .expiresAt(LocalDateTime.now().plusHours(6))
                .co2Saved(0.6).status(SurplusItem.Status.AVAILABLE)
                .createdAt(LocalDateTime.now()).build());

        impactRecordRepository.save(ImpactRecord.builder()
                .shop(shop).co2Saved(12.5).mealsSaved(48).moneySaved(145.00)
                .date(LocalDate.now().minusDays(1)).build());

        impactRecordRepository.save(ImpactRecord.builder()
                .shop(shop).co2Saved(8.3).mealsSaved(32).moneySaved(96.00)
                .date(LocalDate.now().minusDays(2)).build());

        log.info("✅ Demo seeded! Login: shop@demo.com / customer@demo.com / foodbank@demo.com (pw: demo123)");
    }
}
