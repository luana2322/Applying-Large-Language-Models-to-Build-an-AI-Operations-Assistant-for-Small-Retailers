package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record StaffPasswordResetRequestResponse(Long id, Long userId, String message, String status, Long processedById, LocalDateTime createdAt, LocalDateTime processedAt) {}
