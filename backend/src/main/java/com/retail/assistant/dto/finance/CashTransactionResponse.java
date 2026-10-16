package com.retail.assistant.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CashTransactionResponse(Long id, String transactionCode, Long fundId, String direction, BigDecimal amount, String category, String description, String paymentMethod, String status, LocalDate transactionDate, Long financeLedgerId, Long createdById, LocalDateTime createdAt, LocalDateTime updatedAt) {}
