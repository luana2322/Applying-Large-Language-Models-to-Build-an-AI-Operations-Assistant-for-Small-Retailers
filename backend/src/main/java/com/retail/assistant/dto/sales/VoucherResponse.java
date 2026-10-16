package com.retail.assistant.dto.sales;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VoucherResponse(Long id, String code, String name, String discountType, BigDecimal discountValue, BigDecimal maxDiscount, BigDecimal minOrderValue, Boolean isActive, LocalDate validFrom, LocalDate validTo, Integer usedCount, Integer maxUses, LocalDateTime createdAt, LocalDateTime updatedAt) {}
