package com.retail.assistant.dto.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomerRequest(String customerCode, String name, String phone, String email, String addr, Integer loyaltyPoints, BigDecimal totalSpent, String status, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {}
