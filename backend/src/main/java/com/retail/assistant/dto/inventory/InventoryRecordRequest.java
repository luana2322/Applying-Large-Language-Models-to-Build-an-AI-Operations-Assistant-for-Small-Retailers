package com.retail.assistant.dto.inventory;

import java.time.LocalDateTime;

public record InventoryRecordRequest(Long storeId, Long productId, Integer currentStock, LocalDateTime updatedAt) {}
