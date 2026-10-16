package com.retail.assistant.dto.inventory;

import java.time.LocalDateTime;

public record LocationResponse(Long id, String locationCode, String name, String address, String type, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {}
