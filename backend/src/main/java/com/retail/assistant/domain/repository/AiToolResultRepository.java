package com.retail.assistant.domain.repository;

import com.retail.assistant.domain.entity.AiToolResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiToolResultRepository extends JpaRepository<AiToolResult, Long> {
    List<AiToolResult> findByToolCallId(Long toolCallId);
}
