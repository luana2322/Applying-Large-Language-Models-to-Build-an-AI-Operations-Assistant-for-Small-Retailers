package com.retail.assistant.domain.repository;

import com.retail.assistant.domain.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    Optional<AiConversation> findBySessionId(String sessionId);
    Optional<AiConversation> findBySessionIdAndStoreId(String sessionId, Long storeId);
}
