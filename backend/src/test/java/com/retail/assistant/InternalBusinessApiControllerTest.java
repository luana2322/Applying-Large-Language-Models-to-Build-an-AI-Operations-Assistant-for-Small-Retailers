package com.retail.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class InternalBusinessApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private final String internalToken = "retail-internal-secret-token-v1";
    private final String storeId = "1";

    @Test
    @DisplayName("Reject request when missing or invalid internal token")
    void shouldRejectInvalidToken() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/sales-summary")
                .header("X-Internal-Token", "wrong-token")
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("UNAUTHORIZED")));
    }

    @Test
    @DisplayName("Reject request when X-Store-Id header is missing")
    void shouldRejectMissingStoreId() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/sales-summary")
                .header("X-Internal-Token", internalToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("BAD_REQUEST")));
    }

    @Test
    @DisplayName("Reject request for a store that does not exist (store-scope isolation)")
    void shouldRejectNonExistentStore() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/sales-summary")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", "99999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.message", containsString("STORE_NOT_FOUND")));
    }

    @Test
    @DisplayName("Reject request with a non-numeric store id")
    void shouldRejectInvalidStoreId() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/sales-summary")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", "abc")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message", containsString("INVALID_STORE_ID")));
    }

    @Test
    @DisplayName("Tool 1: get_sales_summary returns valid gross and net sales")
    void testSalesSummary() throws Exception {
        Map<String, String> body = Map.of(
            "start_date", "2026-09-01",
            "end_date", "2026-10-15"
        );

        mockMvc.perform(post("/internal/api/v1/business/sales-summary")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.net_revenue", greaterThan(0.0)))
                .andExpect(jsonPath("$.data.valid_order_count", greaterThan(0)));
    }

    @Test
    @DisplayName("Tool 2: get_profit_summary returns net revenue, cogs, gross profit, and margin")
    void testProfitSummary() throws Exception {
        Map<String, String> body = Map.of(
            "start_date", "2026-09-01",
            "end_date", "2026-10-15"
        );

        mockMvc.perform(post("/internal/api/v1/business/profit-summary")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.cost_of_goods_sold", greaterThan(0.0)))
                .andExpect(jsonPath("$.data.gross_profit", greaterThan(0.0)))
                .andExpect(jsonPath("$.data.gross_margin_percentage", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Tool 3: get_top_products returns ranked items with limit")
    void testTopProducts() throws Exception {
        Map<String, Object> body = Map.of(
            "start_date", "2026-09-01",
            "end_date", "2026-10-15",
            "metric", "quantity",
            "limit", 5
        );

        mockMvc.perform(post("/internal/api/v1/business/top-products")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.products", hasSize(lessThanOrEqualTo(5))))
                .andExpect(jsonPath("$.data.products[0].rank", is(1)));
    }

    @Test
    @DisplayName("Tool 4: get_inventory_status detects low stock and out of stock items")
    void testInventoryStatus() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/inventory-status")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "low_stock"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.low_stock_count", greaterThan(0)));
    }

    @Test
    @DisplayName("Tool 5: get_slow_moving_products filters items with low sales")
    void testSlowMovingProducts() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/slow-moving-products")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("lookback_days", 30, "min_stock_quantity", 5, "max_sales_quantity", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.slow_moving_products", notNullValue()));
    }

    @Test
    @DisplayName("Tool 6: get_expense_summary aggregates expenses by category")
    void testExpenseSummary() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/expense-summary")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("start_date", "2026-09-01", "end_date", "2026-10-15"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.total_expense", greaterThan(0.0)))
                .andExpect(jsonPath("$.data.by_category", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("Tool 7: get_restock_suggestions calculates suggested quantities based on velocity")
    void testRestockSuggestions() throws Exception {
        mockMvc.perform(post("/internal/api/v1/business/restock-suggestions")
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", storeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("planning_days", 14, "lookback_days", 30))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.suggestions", notNullValue()));
    }
}
