package com.vesta.vestaai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "surplus_items")
public class SurplusItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column
    private String imageUrl;

    @Column(nullable = false)
    private Double originalPrice;

    @Column(nullable = false)
    private Double discountedPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column
    private String category;

    @Column
    private String dietaryTags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private User shop;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "co2_saved")
    private Double co2Saved;

    public enum Status { AVAILABLE, PARTIALLY_CLAIMED, CLAIMED, DONATED, EXPIRED }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = Status.AVAILABLE;
    }

    public SurplusItem() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }
    public Double getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(Double discountedPrice) { this.discountedPrice = discountedPrice; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDietaryTags() { return dietaryTags; }
    public void setDietaryTags(String dietaryTags) { this.dietaryTags = dietaryTags; }
    public User getShop() { return shop; }
    public void setShop(User shop) { this.shop = shop; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Double getCo2Saved() { return co2Saved; }
    public void setCo2Saved(Double co2Saved) { this.co2Saved = co2Saved; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final SurplusItem item = new SurplusItem();
        public Builder title(String v) { item.title = v; return this; }
        public Builder description(String v) { item.description = v; return this; }
        public Builder imageUrl(String v) { item.imageUrl = v; return this; }
        public Builder originalPrice(Double v) { item.originalPrice = v; return this; }
        public Builder discountedPrice(Double v) { item.discountedPrice = v; return this; }
        public Builder quantity(Integer v) { item.quantity = v; return this; }
        public Builder category(String v) { item.category = v; return this; }
        public Builder dietaryTags(String v) { item.dietaryTags = v; return this; }
        public Builder shop(User v) { item.shop = v; return this; }
        public Builder expiresAt(LocalDateTime v) { item.expiresAt = v; return this; }
        public Builder co2Saved(Double v) { item.co2Saved = v; return this; }
        public Builder status(Status v) { item.status = v; return this; }
        public Builder createdAt(LocalDateTime v) { item.createdAt = v; return this; }
        public SurplusItem build() { return item; }
    }
}
