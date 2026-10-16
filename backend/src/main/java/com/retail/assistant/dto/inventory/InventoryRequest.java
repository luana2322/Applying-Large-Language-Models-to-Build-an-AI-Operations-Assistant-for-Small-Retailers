package com.retail.assistant.dto.inventory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InventoryRequest(Long productId, Long locationId, String batchNumber, LocalDate expiryDate, BigDecimal quantity, BigDecimal minQuantity, LocalDateTime updatedAt) {}
