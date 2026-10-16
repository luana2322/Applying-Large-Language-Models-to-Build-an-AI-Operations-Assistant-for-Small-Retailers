package com.retail.assistant.domain.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.assistant.domain.entity.ai.*;
import com.retail.assistant.domain.repository.ai.*;
import com.retail.assistant.domain.service.ai.AiConversationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Persists AI chat turns for continuity and audit. This is intentionally
 * best-effort: failures must never break the POS/chat flow.
 *
 * NOTE: only structured, already-grounded AI metadata is stored. No secrets,
 * tokens, API keys or raw customer-sensitive data are persisted here.
 */
@Service
public class AiConversationServiceImpl implements AiConversationService {

    private static final Logger logger = LoggerFactory.getLogger(AiConversationServiceImpl.class);

    @Value("${app.ai.max-stored-chars:20000}")
    private int maxStoredChars;

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final AiToolCallRepository toolCallRepository;
    private final AiToolResultRepository toolResultRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiConversationServiceImpl(
        AiConversationRepository conversationRepository,
        AiMessageRepository messageRepository,
        AiToolCallRepository toolCallRepository,
        AiToolResultRepository toolResultRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.toolCallRepository = toolCallRepository;
        this.toolResultRepository = toolResultRepository;
    }

    @Override
    @Transactional
    public AiConversation getOrCreateConversation(String sessionId, Long storeId) {
        return conversationRepository.findBySessionId(sessionId)
            .orElseGet(() -> conversationRepository.save(new AiConversation(sessionId, storeId, null)));
    }

    @Override
    @Transactional
    public AiConversation recordTurn(
        String sessionId,
        Long storeId,
        String userMessage,
        String assistantAnswer,
        String intent,
        String status,
        JsonNode toolCalls
    ) {
        AiConversation conversation = getOrCreateConversation(sessionId, storeId);

        if (conversation.getTitle() == null || conversation.getTitle().isBlank()) {
            conversation.setTitle(truncate(userMessage, 120));
        }

        messageRepository.save(new AiMessage(conversation, "user", truncate(userMessage, maxStoredChars), null, null));

        AiMessage assistantMessage = messageRepository.save(
            new AiMessage(conversation, "assistant", truncate(assistantAnswer, maxStoredChars), intent, status)
        );

        if (toolCalls != null && toolCalls.isArray()) {
            for (JsonNode tc : toolCalls) {
                if (tc == null || !tc.isObject()) continue;
                String toolName = tc.path("name").asText("");
                if (toolName.isBlank()) continue;

                String argumentsJson = serializeBounded(tc.get("arguments"));
                String callStatus = tc.path("status").asText("success");
                String callError = truncate(tc.path("error").isMissingNode() ? null : tc.path("error").asText(null), 1024);

                AiToolCall toolCall = toolCallRepository.save(
                    new AiToolCall(assistantMessage, toolName, argumentsJson, callStatus, callError)
                );

                JsonNode result = tc.get("result");
                if (result != null && !result.isNull()) {
                    toolResultRepository.save(new AiToolResult(toolCall, serializeBounded(result), null));
                } else if (!"success".equalsIgnoreCase(callStatus) && callError != null) {
                    toolResultRepository.save(new AiToolResult(toolCall, null, callError));
                }
            }
        }

        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiMessageView> getMessages(String sessionId, Long storeId) {
        return conversationRepository.findBySessionIdAndStoreId(sessionId, storeId)
            .map(conv -> {
                List<AiMessageView> views = new ArrayList<>();
                for (AiMessage m : messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId())) {
                    views.add(new AiMessageView(
                        m.getId(), m.getRole(), m.getContent(), m.getIntent(), m.getStatus(), m.getCreatedAt().toString()
                    ));
                }
                return views;
            })
            .orElseGet(List::of);
    }

    private String serializeBounded(JsonNode node) {
        if (node == null || node.isNull()) return null;
        try {
            return truncate(objectMapper.writeValueAsString(node), maxStoredChars);
        } catch (Exception e) {
            logger.warn("Failed to serialize AI audit payload: {}", e.getMessage());
            return null;
        }
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        if (value.length() <= max) return value;
        return value.substring(0, max);
    }
}
