package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record RoleResponse(Long id, String name, String description, String permission, Boolean isSystem, LocalDateTime createdAt, LocalDateTime updatedAt) {}
