package com.retail.assistant.dto.supplier;

import java.time.LocalDateTime;

public record SupplierRequest(String supplierCode, String name, String contactPerson, String phone, String email, String addr, String taxCode, String status, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime deletedAt) {}
