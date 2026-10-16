package com.retail.assistant.dto.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VoucherRedemptionResponse(Long id, Long voucherId, Long saleOrderId, BigDecimal discountUsed, LocalDateTime createdAt) {}
