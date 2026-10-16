package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record RoleRequest(String name, String description, String permission, Boolean isSystem, LocalDateTime createdAt, LocalDateTime updatedAt) {}
