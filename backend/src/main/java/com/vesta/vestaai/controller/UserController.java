package com.vesta.vestaai.controller;

import com.vesta.vestaai.model.User;
import com.vesta.vestaai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/foodbanks")
    public List<User> getFoodBanks() {
        return userRepository.findByRole(User.Role.FOOD_BANK);
    }

    @GetMapping("/shops")
    public List<User> getShops() {
        return userRepository.findByRole(User.Role.SHOP);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        if (body.containsKey("businessName")) user.setBusinessName(body.get("businessName"));
        if (body.containsKey("address")) user.setAddress(body.get("address"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        return ResponseEntity.ok(userRepository.save(user));
    }
}
