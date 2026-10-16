package com.retail.assistant.dto.catalog;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProductPriceHistoryRequest(Long productId, BigDecimal costPrice, BigDecimal salePrice, LocalDate effectiveDate, LocalDateTime createdAt) {}
