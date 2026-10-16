package com.retail.assistant.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StockReceiptDetailRequest(Long receiptId, Long productId, Long unitId, BigDecimal quantity, BigDecimal costPrice, String batchNumber, LocalDate expiryDate, BigDecimal lineTotal, LocalDateTime createdAt) {}
