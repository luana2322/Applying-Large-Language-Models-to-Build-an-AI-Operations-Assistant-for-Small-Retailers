package com.retail.assistant.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_tool_calls", indexes = {
    @Index(name = "idx_ai_tool_calls_message", columnList = "message_id")
})
public class AiToolCall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private AiMessage message;

    @Column(name = "tool_name", nullable = false, length = 100)
    private String toolName;

    // JSON-serialized arguments (bounded).
    @Column(length = 20000)
    private String arguments;

    // "success" | "error" | "rejected"
    @Column(length = 32)
    private String status;

    @Column(name = "error_message", length = 1024)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AiToolCall() {}

    public AiToolCall(AiMessage message, String toolName, String arguments, String status, String errorMessage) {
        this.message = message;
        this.toolName = toolName;
        this.arguments = arguments;
        this.status = status;
        this.errorMessage = errorMessage;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AiMessage getMessage() { return message; }
    public void setMessage(AiMessage message) { this.message = message; }
    public String getToolName() { return toolName; }
    public void setToolName(String toolName) { this.toolName = toolName; }
    public String getArguments() { return arguments; }
    public void setArguments(String arguments) { this.arguments = arguments; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
