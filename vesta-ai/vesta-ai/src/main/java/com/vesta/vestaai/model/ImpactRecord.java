package com.vesta.vestaai.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "impact_records")
public class ImpactRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private User shop;

    @Column(nullable = false)
    private Double co2Saved;

    @Column(nullable = false)
    private Integer mealsSaved;

    @Column(nullable = false)
    private Double moneySaved;

    @Column(nullable = false)
    private LocalDate date;

    public ImpactRecord() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getShop() { return shop; }
    public void setShop(User shop) { this.shop = shop; }
    public Double getCo2Saved() { return co2Saved; }
    public void setCo2Saved(Double co2Saved) { this.co2Saved = co2Saved; }
    public Integer getMealsSaved() { return mealsSaved; }
    public void setMealsSaved(Integer mealsSaved) { this.mealsSaved = mealsSaved; }
    public Double getMoneySaved() { return moneySaved; }
    public void setMoneySaved(Double moneySaved) { this.moneySaved = moneySaved; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final ImpactRecord r = new ImpactRecord();
        public Builder shop(User v) { r.shop = v; return this; }
        public Builder co2Saved(Double v) { r.co2Saved = v; return this; }
        public Builder mealsSaved(Integer v) { r.mealsSaved = v; return this; }
        public Builder moneySaved(Double v) { r.moneySaved = v; return this; }
        public Builder date(LocalDate v) { r.date = v; return this; }
        public ImpactRecord build() { return r; }
    }
}
