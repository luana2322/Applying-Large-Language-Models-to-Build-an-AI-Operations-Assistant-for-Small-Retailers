package com.retail.assistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.assistant.domain.entity.system.Store;
import com.retail.assistant.domain.repository.system.StoreRepository;
import com.retail.assistant.domain.service.ai.AiConversationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AiConversationPersistenceTest {

    @Autowired private AiConversationService aiConversationService;
    @Autowired private StoreRepository storeRepository;
    @Autowired private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String internalToken = "retail-internal-secret-token-v1";

    private Long newStoreId() {
        return storeRepository.save(new Store(
            "AI-STORE-" + System.nanoTime(), "AI Test Store", "VND", "Asia/Ho_Chi_Minh")).getId();
    }

    @Test
    @DisplayName("recordTurn persists user + assistant messages and tool calls")
    void recordTurnPersistsMessagesAndTools() throws Exception {
        Long storeId = newStoreId();
        String sessionId = "sess-" + System.nanoTime();

        JsonNode toolCalls = objectMapper.readTree("""
            [{"name":"get_sales_summary","arguments":{"start_date":"2026-03-01","end_date":"2026-03-02"},
              "status":"success","result":{"net_revenue":10000.0,"valid_order_count":2}}]
            """);

        aiConversationService.recordTurn(
            sessionId, storeId, "Doanh thu 2 ngày đầu tháng 3?",
            "Doanh thu thuần là 10,000 VND.", "SALES_SUMMARY", "completed", toolCalls);

        List<AiConversationService.AiMessageView> messages = aiConversationService.getMessages(sessionId, storeId);
        assertEquals(2, messages.size());
        assertEquals("user", messages.get(0).role());
        assertEquals("assistant", messages.get(1).role());
        assertEquals("SALES_SUMMARY", messages.get(1).intent());
        assertEquals("completed", messages.get(1).status());
    }

    @Test
    @DisplayName("Same session across turns reuses one conversation")
    void conversationReusedAcrossTurns() throws Exception {
        Long storeId = newStoreId();
        String sessionId = "sess-reuse-" + System.nanoTime();

        aiConversationService.recordTurn(sessionId, storeId, "Câu 1", "Trả lời 1", "SALES_SUMMARY", "completed", null);
        aiConversationService.recordTurn(sessionId, storeId, "Câu 2", "Trả lời 2", "TOP_PRODUCTS", "completed", null);

        assertEquals(4, aiConversationService.getMessages(sessionId, storeId).size());
    }

    @Test
    @DisplayName("Conversation history is isolated per store")
    void conversationIsolatedPerStore() throws Exception {
        Long storeA = newStoreId();
        Long storeB = newStoreId();
        String sessionId = "sess-iso-" + System.nanoTime();

        aiConversationService.recordTurn(sessionId, storeA, "Hi", "Hello", "GENERAL_HELP", "completed", null);

        assertFalse(aiConversationService.getMessages(sessionId, storeA).isEmpty());
        assertTrue(aiConversationService.getMessages(sessionId, storeB).isEmpty());
    }

    @Test
    @DisplayName("Internal history endpoint requires a valid token and existing store")
    void internalEndpointAuth() throws Exception {
        Long storeId = newStoreId();
        String sessionId = "sess-api-" + System.nanoTime();
        aiConversationService.recordTurn(sessionId, storeId, "Xin chào", "Chào bạn", "GENERAL_HELP", "completed", null);

        mockMvc.perform(get("/internal/api/v1/ai/conversations/{id}/messages", sessionId)
                .header("X-Internal-Token", "wrong-token")
                .header("X-Store-Id", String.valueOf(storeId)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/internal/api/v1/ai/conversations/{id}/messages", sessionId)
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", "99999999"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/internal/api/v1/ai/conversations/{id}/messages", sessionId)
                .header("X-Internal-Token", internalToken)
                .header("X-Store-Id", String.valueOf(storeId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.messages", hasSize(2)))
                .andExpect(jsonPath("$.messages[0].role", is("user")));
    }
}
