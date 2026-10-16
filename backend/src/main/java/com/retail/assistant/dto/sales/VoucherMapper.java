package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.Voucher;

public final class VoucherMapper {
    private VoucherMapper() {}

    public static Voucher toEntity(VoucherRequest r) {
        Voucher e = new Voucher();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Voucher e, VoucherRequest r) {
        if (r.code() != null) e.setCode(r.code());
        if (r.name() != null) e.setName(r.name());
        if (r.discountType() != null) e.setDiscountType(r.discountType());
        if (r.discountValue() != null) e.setDiscountValue(r.discountValue());
        if (r.maxDiscount() != null) e.setMaxDiscount(r.maxDiscount());
        if (r.minOrderValue() != null) e.setMinOrderValue(r.minOrderValue());
        if (r.isActive() != null) e.setIsActive(r.isActive());
        if (r.validFrom() != null) e.setValidFrom(r.validFrom());
        if (r.validTo() != null) e.setValidTo(r.validTo());
        if (r.usedCount() != null) e.setUsedCount(r.usedCount());
        if (r.maxUses() != null) e.setMaxUses(r.maxUses());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static VoucherResponse toResponse(Voucher e) {
        if (e == null) return null;
        return new VoucherResponse(
            e.getId(),
            e.getCode(),
            e.getName(),
            e.getDiscountType(),
            e.getDiscountValue(),
            e.getMaxDiscount(),
            e.getMinOrderValue(),
            e.getIsActive(),
            e.getValidFrom(),
            e.getValidTo(),
            e.getUsedCount(),
            e.getMaxUses(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
