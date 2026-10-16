package com.retail.assistant.dto.catalog;

import java.time.LocalDateTime;

public record ProductImageRequest(Long productId, String imageUrl, String altText, Boolean isPrimary, Integer sortOrder, Integer fileSizeBytes, String mimeType, LocalDateTime createdAt) {}
