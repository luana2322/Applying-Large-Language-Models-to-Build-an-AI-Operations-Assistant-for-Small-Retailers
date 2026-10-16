package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record StaffPasswordResetRequestRequest(Long userId, String message, String status, Long processedById, LocalDateTime createdAt, LocalDateTime processedAt) {}
