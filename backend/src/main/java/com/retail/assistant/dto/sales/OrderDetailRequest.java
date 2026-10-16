package com.retail.assistant.dto.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderDetailRequest(Long orderId, Long productId, Long unitId, BigDecimal quantity, BigDecimal priceAtTime, BigDecimal lineTotal, BigDecimal dispatchedQty, LocalDateTime createdAt) {}
