package com.retail.assistant.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CashFundResponse(Long id, String code, String name, String fundType, BigDecimal balance, Boolean isDefault, Boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {}
