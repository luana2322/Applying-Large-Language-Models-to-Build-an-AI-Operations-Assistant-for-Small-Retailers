package com.retail.assistant.dto.sales;

import java.time.LocalDateTime;

public record OrderResponse(Long id, Long storeId, String orderCode, String status, Double totalGross, Double discount, Double netAmount, String paymentMethod, LocalDateTime createdAt) {}
