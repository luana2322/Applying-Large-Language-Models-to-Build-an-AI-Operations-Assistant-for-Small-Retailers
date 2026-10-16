package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.VoucherRedemption;
import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.entity.sales.Voucher;

public final class VoucherRedemptionMapper {
    private VoucherRedemptionMapper() {}

    public static VoucherRedemption toEntity(VoucherRedemptionRequest r) {
        VoucherRedemption e = new VoucherRedemption();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(VoucherRedemption e, VoucherRedemptionRequest r) {
        if (r.voucherId() != null) {
            Voucher ref = new Voucher();
            ref.setId(r.voucherId());
            e.setVoucher(ref);
        }
        if (r.saleOrderId() != null) {
            SaleOrder ref = new SaleOrder();
            ref.setId(r.saleOrderId());
            e.setSaleOrder(ref);
        }
        if (r.discountUsed() != null) e.setDiscountUsed(r.discountUsed());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static VoucherRedemptionResponse toResponse(VoucherRedemption e) {
        if (e == null) return null;
        return new VoucherRedemptionResponse(
            e.getId(),
            e.getVoucher() != null ? e.getVoucher().getId() : null,
            e.getSaleOrder() != null ? e.getSaleOrder().getId() : null,
            e.getDiscountUsed(),
            e.getCreatedAt()
        );
    }
}
