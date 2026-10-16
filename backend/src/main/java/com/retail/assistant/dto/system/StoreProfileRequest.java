package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record StoreProfileRequest(Long ownerId, String name, String businessCategory, String address, String phone, String email, String website, String taxCode, String logoUrl, String currency, String timezone, LocalDateTime createdAt, LocalDateTime updatedAt) {}
