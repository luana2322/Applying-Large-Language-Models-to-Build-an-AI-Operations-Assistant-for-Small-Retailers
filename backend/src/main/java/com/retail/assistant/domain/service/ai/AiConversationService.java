package com.retail.assistant.domain.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.retail.assistant.domain.entity.ai.AiConversation;

import java.util.List;

/**
 * Persists AI chat turns for continuity and audit.
 */
public interface AiConversationService {

    AiConversation getOrCreateConversation(String sessionId, Long storeId);

    AiConversation recordTurn(
        String sessionId,
        Long storeId,
        String userMessage,
        String assistantAnswer,
        String intent,
        String status,
        JsonNode toolCalls
    );

    List<AiMessageView> getMessages(String sessionId, Long storeId);

    record AiMessageView(
        Long id,
        String role,
        String content,
        String intent,
        String status,
        String createdAt
    ) {}
}
