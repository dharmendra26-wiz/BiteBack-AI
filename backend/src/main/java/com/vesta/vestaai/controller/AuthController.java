package com.vesta.vestaai.controller;

import com.vesta.vestaai.model.User;
import com.vesta.vestaai.repository.UserRepository;
import com.vesta.vestaai.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");
        String password = body.get("password");
        String roleStr = body.getOrDefault("role", "CUSTOMER");

        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        if (userRepository.existsByUsername(username))
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));

        User.Role role;
        try { role = User.Role.valueOf(roleStr.toUpperCase()); }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }

        User user = User.builder()
                .email(email).username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .businessName(body.getOrDefault("businessName", ""))
                .address(body.getOrDefault("address", ""))
                .phone(body.getOrDefault("phone", ""))
                .build();
        userRepository.save(user);

        String token = jwtUtil.generateToken(email, role.name());
        return ResponseEntity.ok(Map.of(
                "token", token, "userId", user.getId(),
                "username", user.getUsername(), "email", user.getEmail(),
                "role", user.getRole().name(),
                "businessName", user.getBusinessName() != null ? user.getBusinessName() : ""
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        return userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(email, u.getRole().name());
                    return ResponseEntity.ok(Map.of(
                            "token", token, "userId", u.getId(),
                            "username", u.getUsername(), "email", u.getEmail(),
                            "role", u.getRole().name(),
                            "businessName", u.getBusinessName() != null ? u.getBusinessName() : ""
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid email or password")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(), "username", user.getUsername(),
                "email", user.getEmail(), "role", user.getRole().name(),
                "businessName", user.getBusinessName() != null ? user.getBusinessName() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "phone", user.getPhone() != null ? user.getPhone() : ""
        ));
    }
}
