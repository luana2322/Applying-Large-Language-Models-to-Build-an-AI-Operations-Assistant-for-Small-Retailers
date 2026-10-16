package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record StoreRequest(String code, String name, String currency, String timezone, LocalDateTime createdAt) {}
