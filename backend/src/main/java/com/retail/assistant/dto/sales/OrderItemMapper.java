package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.OrderItem;
import com.retail.assistant.domain.entity.sales.Order;
import com.retail.assistant.domain.entity.catalog.Product;

public final class OrderItemMapper {
    private OrderItemMapper() {}

    public static OrderItem toEntity(OrderItemRequest r) {
        OrderItem e = new OrderItem();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(OrderItem e, OrderItemRequest r) {
        if (r.orderId() != null) {
            Order ref = new Order();
            ref.setId(r.orderId());
            e.setOrder(ref);
        }
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.quantity() != null) e.setQuantity(r.quantity());
        if (r.unitPrice() != null) e.setUnitPrice(r.unitPrice());
        if (r.costPrice() != null) e.setCostPrice(r.costPrice());
        if (r.subtotal() != null) e.setSubtotal(r.subtotal());
    }

    public static OrderItemResponse toResponse(OrderItem e) {
        if (e == null) return null;
        return new OrderItemResponse(
            e.getId(),
            e.getOrder() != null ? e.getOrder().getId() : null,
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getQuantity(),
            e.getUnitPrice(),
            e.getCostPrice(),
            e.getSubtotal()
        );
    }
}
