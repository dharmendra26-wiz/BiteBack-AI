package com.vesta.vestaai.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column
    private String businessName;

    @Column
    private String address;

    @Column
    private String phone;

    public enum Role { SHOP, CUSTOMER, FOOD_BANK }

    public User() {}

    public User(Long id, String username, String email, String password,
                Role role, String businessName, String address, String phone) {
        this.id = id; this.username = username; this.email = email;
        this.password = password; this.role = role;
        this.businessName = businessName; this.address = address; this.phone = phone;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String username, email, password, businessName, address, phone;
        private Role role;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String v) { this.username = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder password(String v) { this.password = v; return this; }
        public Builder role(Role v) { this.role = v; return this; }
        public Builder businessName(String v) { this.businessName = v; return this; }
        public Builder address(String v) { this.address = v; return this; }
        public Builder phone(String v) { this.phone = v; return this; }
        public User build() {
            return new User(id, username, email, password, role, businessName, address, phone);
        }
    }
}
