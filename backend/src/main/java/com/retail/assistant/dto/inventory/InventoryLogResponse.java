package com.retail.assistant.dto.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryLogResponse(Long id, Long productId, String actionType, BigDecimal quantityChange, Long unitId, Long userId, Long dispatchId, Long receiptId, Long fromLocationId, Long toLocationId, String referenceNote, LocalDateTime createdAt) {}
