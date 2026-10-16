package com.retail.assistant.dto.catalog;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductUnitRequest(Long productId, String unitName, BigDecimal conversionRate, Boolean isBaseUnit, LocalDateTime createdAt, LocalDateTime updatedAt) {}
