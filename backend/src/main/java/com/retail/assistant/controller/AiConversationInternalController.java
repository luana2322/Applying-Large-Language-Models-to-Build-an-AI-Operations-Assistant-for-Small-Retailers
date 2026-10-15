package com.retail.assistant.controller;

import com.retail.assistant.domain.repository.StoreRepository;
import com.retail.assistant.domain.service.AiConversationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Internal, service-to-service endpoints for AI conversation audit.
 * Protected by the shared internal token + validated store scope.
 */
@RestController
@RequestMapping("/internal/api/v1/ai")
public class AiConversationInternalController {

    @Value("${app.internal-auth-token:retail-internal-secret-token-v1}")
    private String configuredInternalToken;

    private final StoreRepository storeRepository;
    private final AiConversationService aiConversationService;

    public AiConversationInternalController(StoreRepository storeRepository, AiConversationService aiConversationService) {
        this.storeRepository = storeRepository;
        this.aiConversationService = aiConversationService;
    }

    private Long validateAuthAndStore(String token, String storeIdHeader) {
        if (token == null || !token.equals(configuredInternalToken)) {
            throw new SecurityException("UNAUTHORIZED_INTERNAL_CALL: Invalid internal service token");
        }
        if (storeIdHeader == null || storeIdHeader.isBlank()) {
            throw new IllegalArgumentException("MISSING_STORE_ID: X-Store-Id header is required");
        }
        try {
            Long storeId = Long.parseLong(storeIdHeader.trim());
            if (!storeRepository.existsById(storeId)) {
                throw new IllegalArgumentException("STORE_NOT_FOUND: Store ID does not exist");
            }
            return storeId;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("INVALID_STORE_ID: Must be a valid integer");
        }
    }

    @GetMapping("/conversations/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> getConversationMessages(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @PathVariable String sessionId
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        List<AiConversationService.AiMessageView> messages = aiConversationService.getMessages(sessionId, storeId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "session_id", sessionId,
            "store_id", storeId,
            "messages", messages
        ));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurity(SecurityException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
            "success", false,
            "error", Map.of("code", "UNAUTHORIZED", "message", e.getMessage())
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadReq(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
            "success", false,
            "error", Map.of("code", "BAD_REQUEST", "message", e.getMessage())
        ));
    }
}
