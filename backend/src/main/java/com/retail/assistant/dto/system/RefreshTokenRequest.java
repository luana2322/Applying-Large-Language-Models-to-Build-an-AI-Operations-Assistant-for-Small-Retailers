package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record RefreshTokenRequest(Long userId, String token, LocalDateTime expiresAt, String userAgent, String ipAddress, LocalDateTime createdAt, LocalDateTime deletedAt) {}
