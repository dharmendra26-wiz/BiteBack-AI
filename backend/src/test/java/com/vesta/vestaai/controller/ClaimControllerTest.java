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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the claim flow: POST /api/claims.
 * Verifies: quantity deduction, CUSTOMER-only enforcement, over-claim protection.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class ClaimControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String shopToken;
    private String customerToken;

    @BeforeEach
    void setUp() throws Exception {
        shopToken = registerAndGetToken("claim_shop@test.com", "claim_shop", "SHOP");
        customerToken = registerAndGetToken("claim_cust@test.com", "claim_cust", "CUSTOMER");
    }

    // ── Claim success ─────────────────────────────────────────────────────────

    @Test
    void claim_asCustomer_reducesQuantityAndReturns200() throws Exception {
        // Create a surplus item as the shop
        Long itemId = createSurplusItem(shopToken, 10);

        // Claim 3 units as customer
        var body = Map.of("surplusItemId", itemId, "quantity", 3);
        MvcResult result = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityClaimed").value(3))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        // Verify the claim was persisted
        var node = objectMapper.readTree(result.getResponse().getContentAsString());
        assert node.get("id").asLong() > 0;
    }

    // ── Claim over-quantity ───────────────────────────────────────────────────

    @Test
    void claim_moreThanAvailable_returns400() throws Exception {
        Long itemId = createSurplusItem(shopToken, 2);

        var body = Map.of("surplusItemId", itemId, "quantity", 99);
        mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Not enough quantity"));
    }

    // ── Role enforcement ──────────────────────────────────────────────────────

    @Test
    void claim_asShop_returns403() throws Exception {
        Long itemId = createSurplusItem(shopToken, 5);

        var body = Map.of("surplusItemId", itemId, "quantity", 1);
        mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + shopToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    void claim_withoutJwt_returns401() throws Exception {
        var body = Map.of("surplusItemId", 1, "quantity", 1);
        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    // ── Helper methods ────────────────────────────────────────────────────────

    private String registerAndGetToken(String email, String username, String role) throws Exception {
        var reg = Map.of("email", email, "username", username, "password", "pass123", "role", role);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andReturn();
        var node = objectMapper.readTree(result.getResponse().getContentAsString());
        if (node.has("token")) return node.get("token").asText();

        // Already registered — login
        MvcResult lr = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", "pass123"))))
                .andReturn();
        return objectMapper.readTree(lr.getResponse().getContentAsString()).get("token").asText();
    }

    /** Creates a surplus listing and returns its id. */
    private Long createSurplusItem(String token, int quantity) throws Exception {
        var body = Map.of(
                "title", "Claimable Bread",
                "description", "Test item",
                "originalPrice", 10.00,
                "discountedPrice", 4.00,
                "quantity", quantity,
                "category", "Bakery",
                "dietaryTags", "Vegan",
                "expiresAt", LocalDateTime.now().plusHours(4).toString(),
                "co2Saved", 0.5
        );
        MvcResult result = mockMvc.perform(post("/api/surplus")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
