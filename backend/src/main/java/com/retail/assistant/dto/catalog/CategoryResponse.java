package com.retail.assistant.dto.catalog;

import java.time.LocalDateTime;

public record CategoryResponse(Long id, String categoryCode, String name, String description, Long parentId, Integer sortOrder, String status, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {}
