package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.Order;

public final class OrderMapper {
    private OrderMapper() {}

    public static Order toEntity(OrderRequest r) {
        Order e = new Order();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Order e, OrderRequest r) {
        if (r.storeId() != null) e.setStoreId(r.storeId());
        if (r.orderCode() != null) e.setOrderCode(r.orderCode());
        if (r.status() != null) e.setStatus(r.status());
        if (r.totalGross() != null) e.setTotalGross(r.totalGross());
        if (r.discount() != null) e.setDiscount(r.discount());
        if (r.netAmount() != null) e.setNetAmount(r.netAmount());
        if (r.paymentMethod() != null) e.setPaymentMethod(r.paymentMethod());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static OrderResponse toResponse(Order e) {
        if (e == null) return null;
        return new OrderResponse(
            e.getId(),
            e.getStoreId(),
            e.getOrderCode(),
            e.getStatus(),
            e.getTotalGross(),
            e.getDiscount(),
            e.getNetAmount(),
            e.getPaymentMethod(),
            e.getCreatedAt()
        );
    }
}
