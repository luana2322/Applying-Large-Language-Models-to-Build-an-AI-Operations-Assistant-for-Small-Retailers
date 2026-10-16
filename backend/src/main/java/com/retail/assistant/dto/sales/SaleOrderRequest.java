package com.retail.assistant.dto.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SaleOrderRequest(String orderCode, Long customerId, Long userId, BigDecimal totalAmount, BigDecimal discountAmount, BigDecimal finalAmount, BigDecimal paidAmount, String status, Long parentOrderId, String shippingAddress, String notes, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime cancelledAt, Long cancelledById) {}
