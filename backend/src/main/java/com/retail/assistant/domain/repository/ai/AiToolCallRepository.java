package com.retail.assistant.domain.repository.ai;

import com.retail.assistant.domain.entity.ai.AiToolCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiToolCallRepository extends JpaRepository<AiToolCall, Long> {
    List<AiToolCall> findByMessageId(Long messageId);
}
