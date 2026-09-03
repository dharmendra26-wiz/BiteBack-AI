package com.vesta.vestaai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for /api/auth — register, login, /me.
 * Uses H2 in-memory DB (application-test.properties) so no Postgres is needed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── Register ──────────────────────────────────────────────────────────────

    @Test
    void register_withValidPayload_returns200AndToken() throws Exception {
        var body = Map.of(
                "email", "newuser@test.com",
                "username", "new_user",
                "password", "password123",
                "role", "CUSTOMER"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.email").value("newuser@test.com"));
    }

    @Test
    void register_withDuplicateEmail_returns400() throws Exception {
        // First registration
        var body = Map.of("email", "dup@test.com", "username", "dup_user",
                "password", "pass", "role", "CUSTOMER");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));

        // Second registration with same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returns200AndToken() throws Exception {
        // Seed a user via register first
        var reg = Map.of("email", "login_ok@test.com", "username", "login_ok",
                "password", "mypassword", "role", "SHOP");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        // Now login
        var body = Map.of("email", "login_ok@test.com", "password", "mypassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("SHOP"));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        var reg = Map.of("email", "login_bad@test.com", "username", "login_bad",
                "password", "correct_pass", "role", "CUSTOMER");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        var body = Map.of("email", "login_bad@test.com", "password", "wrong_pass");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_withUnknownEmail_returns401() throws Exception {
        var body = Map.of("email", "nobody@test.com", "password", "pass");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    // ── /me ───────────────────────────────────────────────────────────────────

    @Test
    void me_withValidJwt_returns200WithUserDetails() throws Exception {
        // Register and capture token
        var reg = Map.of("email", "me_user@test.com", "username", "me_user",
                "password", "pass123", "role", "FOOD_BANK");
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me_user@test.com"))
                .andExpect(jsonPath("$.role").value("FOOD_BANK"));
    }

    @Test
    void me_withoutJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
