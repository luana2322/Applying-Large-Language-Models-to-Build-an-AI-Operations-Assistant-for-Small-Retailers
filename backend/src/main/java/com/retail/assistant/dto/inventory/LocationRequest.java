package com.retail.assistant.dto.inventory;

import java.time.LocalDateTime;

public record LocationRequest(String locationCode, String name, String address, String type, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {}
