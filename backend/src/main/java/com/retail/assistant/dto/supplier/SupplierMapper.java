package com.retail.assistant.dto.supplier;

import com.retail.assistant.domain.entity.supplier.Supplier;

public final class SupplierMapper {
    private SupplierMapper() {}

    public static Supplier toEntity(SupplierRequest r) {
        Supplier e = new Supplier();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Supplier e, SupplierRequest r) {
        if (r.supplierCode() != null) e.setSupplierCode(r.supplierCode());
        if (r.name() != null) e.setName(r.name());
        if (r.contactPerson() != null) e.setContactPerson(r.contactPerson());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.email() != null) e.setEmail(r.email());
        if (r.addr() != null) e.setAddr(r.addr());
        if (r.taxCode() != null) e.setTaxCode(r.taxCode());
        if (r.status() != null) e.setStatus(r.status());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
        if (r.deletedAt() != null) e.setDeletedAt(r.deletedAt());
    }

    public static SupplierResponse toResponse(Supplier e) {
        if (e == null) return null;
        return new SupplierResponse(
            e.getId(),
            e.getSupplierCode(),
            e.getName(),
            e.getContactPerson(),
            e.getPhone(),
            e.getEmail(),
            e.getAddr(),
            e.getTaxCode(),
            e.getStatus(),
            e.getCreatedAt(),
            e.getUpdatedAt(),
            e.getDeletedAt()
        );
    }
}
