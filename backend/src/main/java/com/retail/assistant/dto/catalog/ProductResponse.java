package com.retail.assistant.dto.catalog;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(Long id, Long categoryId, String sku, String barcode, String name, String imageUrl, String description, BigDecimal weight, String status, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt, Long storeId, String unit, Double costPrice, Double sellingPrice, Integer minStockLevel, String categoryName) {}
