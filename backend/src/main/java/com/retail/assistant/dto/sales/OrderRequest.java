package com.retail.assistant.dto.sales;

import java.time.LocalDateTime;

public record OrderRequest(Long storeId, String orderCode, String status, Double totalGross, Double discount, Double netAmount, String paymentMethod, LocalDateTime createdAt) {}
