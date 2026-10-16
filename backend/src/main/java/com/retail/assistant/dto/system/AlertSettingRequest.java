package com.retail.assistant.dto.system;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AlertSettingRequest(Long ownerId, String alertType, BigDecimal thresholdValue, String channel, String frequency, Boolean isEnabled, String recipients, LocalDateTime createdAt, LocalDateTime updatedAt) {}
