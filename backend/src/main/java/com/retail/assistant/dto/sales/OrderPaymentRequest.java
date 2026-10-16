package com.retail.assistant.dto.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderPaymentRequest(Long orderId, String paymentCode, String method, BigDecimal amount, String transactionRef, String status, LocalDateTime paidAt, String notes, Long createdById, LocalDateTime createdAt) {}
