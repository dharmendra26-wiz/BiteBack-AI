package com.vesta.vestaai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surplus_item_id", nullable = false)
    private SurplusItem surplusItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private Integer quantityClaimed;

    @Column(nullable = false)
    private LocalDateTime claimedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    public enum Status { PENDING, CONFIRMED, COLLECTED, CANCELLED }

    @PrePersist
    public void prePersist() {
        this.claimedAt = LocalDateTime.now();
        if (this.status == null) this.status = Status.PENDING;
    }

    public Claim() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SurplusItem getSurplusItem() { return surplusItem; }
    public void setSurplusItem(SurplusItem surplusItem) { this.surplusItem = surplusItem; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public Integer getQuantityClaimed() { return quantityClaimed; }
    public void setQuantityClaimed(Integer quantityClaimed) { this.quantityClaimed = quantityClaimed; }
    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Claim c = new Claim();
        public Builder surplusItem(SurplusItem v) { c.surplusItem = v; return this; }
        public Builder customer(User v) { c.customer = v; return this; }
        public Builder quantityClaimed(Integer v) { c.quantityClaimed = v; return this; }
        public Builder status(Status v) { c.status = v; return this; }
        public Claim build() { return c; }
    }
}
