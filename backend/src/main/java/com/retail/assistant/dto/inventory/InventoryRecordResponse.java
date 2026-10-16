package com.retail.assistant.dto.inventory;

import java.time.LocalDateTime;

public record InventoryRecordResponse(Long id, Long storeId, Long productId, Integer currentStock, LocalDateTime updatedAt) {}
