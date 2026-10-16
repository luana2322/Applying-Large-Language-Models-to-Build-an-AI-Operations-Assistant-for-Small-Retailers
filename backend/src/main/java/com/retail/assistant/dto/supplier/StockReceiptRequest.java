package com.retail.assistant.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StockReceiptRequest(String receiptCode, Long supplierId, Long staffId, LocalDate receiptDate, String status, String invoiceNumber, BigDecimal totalAmount, String notes, Long approvedById, LocalDateTime approvedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {}
