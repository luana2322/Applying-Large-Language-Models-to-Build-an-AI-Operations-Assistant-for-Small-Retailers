package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record StoreResponse(Long id, String code, String name, String currency, String timezone, LocalDateTime createdAt) {}
