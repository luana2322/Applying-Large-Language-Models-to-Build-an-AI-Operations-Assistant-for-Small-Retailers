package com.retail.assistant.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tool_results", indexes = {
    @Index(name = "idx_ai_tool_results_call", columnList = "tool_call_id")
})
public class AiToolResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tool_call_id", nullable = false)
    private AiToolCall toolCall;

    // JSON-serialized, size-capped result payload (bounded).
    @Column(name = "result_data", length = 20000)
    private String resultData;

    @Column(name = "error_message", length = 1024)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AiToolResult() {}

    public AiToolResult(AiToolCall toolCall, String resultData, String errorMessage) {
        this.toolCall = toolCall;
        this.resultData = resultData;
        this.errorMessage = errorMessage;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AiToolCall getToolCall() { return toolCall; }
    public void setToolCall(AiToolCall toolCall) { this.toolCall = toolCall; }
    public String getResultData() { return resultData; }
    public void setResultData(String resultData) { this.resultData = resultData; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
