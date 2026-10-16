package com.retail.assistant.dto.supplier;

import java.time.LocalDateTime;

public record SupplierResponse(Long id, String supplierCode, String name, String contactPerson, String phone, String email, String addr, String taxCode, String status, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {}
