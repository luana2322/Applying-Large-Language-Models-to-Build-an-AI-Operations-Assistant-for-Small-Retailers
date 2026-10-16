package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record RefreshTokenResponse(Long id, Long userId, LocalDateTime expiresAt, String userAgent, String ipAddress, LocalDateTime createdAt, LocalDateTime deletedAt) {}
