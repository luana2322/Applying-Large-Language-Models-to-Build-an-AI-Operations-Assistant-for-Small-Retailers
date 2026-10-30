package com.retail.assistant.controller.system;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.assistant.domain.entity.system.Store;
import com.retail.assistant.domain.repository.system.StoreRepository;
import com.retail.assistant.domain.service.ai.AiConversationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class StoreChatGatewayController {

    private static final Logger logger = LoggerFactory.getLogger(StoreChatGatewayController.class);

    @Value("${app.ai-service-url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${app.internal-auth-token:retail-internal-secret-token-v1}")
    private String internalAuthToken;

    private final StoreRepository storeRepository;
    private final AiConversationService aiConversationService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StoreChatGatewayController(StoreRepository storeRepository, AiConversationService aiConversationService) {
        this.storeRepository = storeRepository;
        this.aiConversationService = aiConversationService;
    }

    @GetMapping("/store/current")
    public ResponseEntity<?> getCurrentStore(@RequestHeader(value = "X-Store-Code", defaultValue = "STORE-001") String storeCode) {
        Store store = storeRepository.findByCode(storeCode)
            .orElseGet(() -> storeRepository.findAll().stream().findFirst().orElse(null));

        if (store == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No store found"));
        }
        return ResponseEntity.ok(Map.of(
            "store_id", store.getId(),
            "code", store.getCode(),
            "name", store.getName(),
            "currency", store.getCurrency(),
            "timezone", store.getTimezone()
        ));
    }

    @PostMapping({"/chat", "/ai/chat/stream"})
    public ResponseEntity<?> chatWithAi(
        @RequestHeader(value = "X-Store-Code", defaultValue = "STORE-001") String storeCode,
        @RequestBody Map<String, Object> clientRequest
    ) {
        Store store = storeRepository.findByCode(storeCode)
            .orElseGet(() -> storeRepository.findAll().stream().findFirst().orElse(null));

        if (store == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid store"));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Token", internalAuthToken);
        headers.set("X-Store-Id", String.valueOf(store.getId()));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(clientRequest, headers);

        try {
            String targetUrl = aiServiceUrl + "/internal/v1/ai/chat";
            ResponseEntity<String> response = restTemplate.postForEntity(targetUrl, entity, String.class);
            persistTurnBestEffort(store, clientRequest, response.getBody());
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", "failed",
                "answer", "Không thể kết nối đến AI Service tại thời điểm này. Vui lòng kiểm tra lại dịch vụ.",
                "error", Map.of("code", "AI_SERVICE_UNAVAILABLE", "message", e.getMessage())
            ));
        }
    }

    /**
     * Best-effort audit persistence of an AI turn. Any failure here is logged but
     * must never affect the chat response returned to the user.
     */
    private void persistTurnBestEffort(Store store, Map<String, Object> clientRequest, String responseBody) {
        try {
            if (responseBody == null || responseBody.isBlank()) return;
            JsonNode parsed = objectMapper.readTree(responseBody);
            String sessionId = parsed.path("session_id").asText(null);
            if (sessionId == null || sessionId.isBlank()) return;

            Object rawMessage = clientRequest.get("message");
            String userMessage = rawMessage != null ? String.valueOf(rawMessage) : "";

            aiConversationService.recordTurn(
                sessionId,
                store.getId(),
                userMessage,
                parsed.path("answer").asText(""),
                parsed.path("intent").asText(null),
                parsed.path("status").asText("completed"),
                parsed.path("tool_calls")
            );
        } catch (Exception ex) {
            logger.warn("Failed to persist AI conversation audit for store {}: {}", store.getId(), ex.getMessage());
        }
    }
}
