package com.vesta.vestaai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surplus_item_id", nullable = false)
    private SurplusItem surplusItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_bank_id", nullable = false)
    private User foodBank;

    @Column(nullable = false)
    private Integer quantityDonated;

    @Column(nullable = false)
    private LocalDateTime donatedAt;

    @Column
    private String notes;

    @PrePersist
    public void prePersist() {
        this.donatedAt = LocalDateTime.now();
    }

    public Donation() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SurplusItem getSurplusItem() { return surplusItem; }
    public void setSurplusItem(SurplusItem surplusItem) { this.surplusItem = surplusItem; }
    public User getFoodBank() { return foodBank; }
    public void setFoodBank(User foodBank) { this.foodBank = foodBank; }
    public Integer getQuantityDonated() { return quantityDonated; }
    public void setQuantityDonated(Integer quantityDonated) { this.quantityDonated = quantityDonated; }
    public LocalDateTime getDonatedAt() { return donatedAt; }
    public void setDonatedAt(LocalDateTime donatedAt) { this.donatedAt = donatedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Donation d = new Donation();
        public Builder surplusItem(SurplusItem v) { d.surplusItem = v; return this; }
        public Builder foodBank(User v) { d.foodBank = v; return this; }
        public Builder quantityDonated(Integer v) { d.quantityDonated = v; return this; }
        public Builder notes(String v) { d.notes = v; return this; }
        public Donation build() { return d; }
    }
}
