package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record NotificationRequest(Long userId, String notificationType, String title, String message, Boolean isRead, String referenceType, Long referenceId, LocalDateTime createdAt, LocalDateTime readAt) {}
