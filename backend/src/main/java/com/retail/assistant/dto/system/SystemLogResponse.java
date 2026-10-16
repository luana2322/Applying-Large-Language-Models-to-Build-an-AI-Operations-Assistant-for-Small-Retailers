package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record SystemLogResponse(Long id, String logLevel, String module, String action, Long userId, String message, String stackTrace, String contextData, String ipAddress, LocalDateTime createdAt) {}
