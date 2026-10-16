package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.entity.sales.Customer;
import com.retail.assistant.domain.entity.system.User;

public final class SaleOrderMapper {
    private SaleOrderMapper() {}

    public static SaleOrder toEntity(SaleOrderRequest r) {
        SaleOrder e = new SaleOrder();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(SaleOrder e, SaleOrderRequest r) {
        if (r.orderCode() != null) e.setOrderCode(r.orderCode());
        if (r.customerId() != null) {
            Customer ref = new Customer();
            ref.setId(r.customerId());
            e.setCustomer(ref);
        }
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.totalAmount() != null) e.setTotalAmount(r.totalAmount());
        if (r.discountAmount() != null) e.setDiscountAmount(r.discountAmount());
        if (r.finalAmount() != null) e.setFinalAmount(r.finalAmount());
        if (r.paidAmount() != null) e.setPaidAmount(r.paidAmount());
        if (r.status() != null) e.setStatus(r.status());
        if (r.parentOrderId() != null) {
            SaleOrder ref = new SaleOrder();
            ref.setId(r.parentOrderId());
            e.setParentOrder(ref);
        }
        if (r.shippingAddress() != null) e.setShippingAddress(r.shippingAddress());
        if (r.notes() != null) e.setNotes(r.notes());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
        if (r.cancelledAt() != null) e.setCancelledAt(r.cancelledAt());
        if (r.cancelledById() != null) {
            User ref = new User();
            ref.setId(r.cancelledById());
            e.setCancelledBy(ref);
        }
    }

    public static SaleOrderResponse toResponse(SaleOrder e) {
        if (e == null) return null;
        return new SaleOrderResponse(
            e.getId(),
            e.getOrderCode(),
            e.getCustomer() != null ? e.getCustomer().getId() : null,
            e.getUser() != null ? e.getUser().getId() : null,
            e.getTotalAmount(),
            e.getDiscountAmount(),
            e.getFinalAmount(),
            e.getPaidAmount(),
            e.getStatus(),
            e.getParentOrder() != null ? e.getParentOrder().getId() : null,
            e.getShippingAddress(),
            e.getNotes(),
            e.getCreatedAt(),
            e.getUpdatedAt(),
            e.getCancelledAt(),
            e.getCancelledBy() != null ? e.getCancelledBy().getId() : null
        );
    }
}
