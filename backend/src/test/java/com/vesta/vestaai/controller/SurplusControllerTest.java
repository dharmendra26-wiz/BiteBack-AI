package com.vesta.vestaai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for /api/surplus.
 * Covers: public GET, unauthenticated POST (401), SHOP POST (201), CUSTOMER POST (403).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class SurplusControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String shopToken;

    /** Register a SHOP user and store the JWT for authenticated calls. */
    @BeforeEach
    void setUp() throws Exception {
        var reg = Map.of("email", "surplus_shop@test.com", "username", "surplus_shop",
                "password", "pass123", "role", "SHOP", "businessName", "Test Bakery");
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        // Token may already exist if context was not reset — fall back to login
        var node = objectMapper.readTree(result.getResponse().getContentAsString());
        if (node.has("token")) {
            shopToken = node.get("token").asText();
        } else {
            // Duplicate register — log in instead
            MvcResult lr = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    Map.of("email", "surplus_shop@test.com", "password", "pass123"))))
                    .andReturn();
            shopToken = objectMapper.readTree(lr.getResponse().getContentAsString())
                    .get("token").asText();
        }
    }

    // ── Public GET /api/surplus ───────────────────────────────────────────────

    @Test
    void getAvailable_isPublic_returns200() throws Exception {
        mockMvc.perform(get("/api/surplus"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    // ── POST /api/surplus ─────────────────────────────────────────────────────

    @Test
    void createListing_withoutJwt_returns401() throws Exception {
        mockMvc.perform(post("/api/surplus")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createListing_asCustomer_returns403() throws Exception {
        // Register a CUSTOMER
        var reg = Map.of("email", "surplus_cust@test.com", "username", "surplus_cust",
                "password", "pass123", "role", "CUSTOMER");
        MvcResult lr = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();
        var node = objectMapper.readTree(lr.getResponse().getContentAsString());
        String customerToken = node.has("token") ? node.get("token").asText() :
                getTokenViaLogin("surplus_cust@test.com", "pass123");

        mockMvc.perform(post("/api/surplus")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildListingBody())))
                .andExpect(status().isForbidden());
    }

    @Test
    void createListing_asShop_returns200AndPersistsItem() throws Exception {
        mockMvc.perform(post("/api/surplus")
                        .header("Authorization", "Bearer " + shopToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildListingBody())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Test Bread"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    void createListing_asShop_appearsInPublicList() throws Exception {
        // Create a listing with a unique title
        var body = buildListingBody();
        body = new java.util.HashMap<>(body);
        ((Map<String, Object>) body).put("title", "UniqueVisibleBread");

        mockMvc.perform(post("/api/surplus")
                .header("Authorization", "Bearer " + shopToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));

        mockMvc.perform(get("/api/surplus"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", hasItem("UniqueVisibleBread")));
    }

    // ── Helper methods ────────────────────────────────────────────────────────

    private Map<String, Object> buildListingBody() {
        return Map.of(
                "title", "Test Bread",
                "description", "Fresh sourdough",
                "originalPrice", 10.00,
                "discountedPrice", 4.00,
                "quantity", 5,
                "category", "Bakery",
                "dietaryTags", "Vegan",
                "expiresAt", LocalDateTime.now().plusHours(4).toString(),
                "co2Saved", 0.8
        );
    }

    private String getTokenViaLogin(String email, String password) throws Exception {
        MvcResult lr = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andReturn();
        return objectMapper.readTree(lr.getResponse().getContentAsString()).get("token").asText();
    }
}
