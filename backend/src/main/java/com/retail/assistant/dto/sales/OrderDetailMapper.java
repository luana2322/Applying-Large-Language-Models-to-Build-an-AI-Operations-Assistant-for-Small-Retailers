package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.OrderDetail;
import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.ProductUnit;
import com.retail.assistant.domain.entity.sales.SaleOrder;

public final class OrderDetailMapper {
    private OrderDetailMapper() {}

    public static OrderDetail toEntity(OrderDetailRequest r) {
        OrderDetail e = new OrderDetail();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(OrderDetail e, OrderDetailRequest r) {
        if (r.orderId() != null) {
            SaleOrder ref = new SaleOrder();
            ref.setId(r.orderId());
            e.setOrder(ref);
        }
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.unitId() != null) {
            ProductUnit ref = new ProductUnit();
            ref.setId(r.unitId());
            e.setUnit(ref);
        }
        if (r.quantity() != null) e.setQuantity(r.quantity());
        if (r.priceAtTime() != null) e.setPriceAtTime(r.priceAtTime());
        if (r.lineTotal() != null) e.setLineTotal(r.lineTotal());
        if (r.dispatchedQty() != null) e.setDispatchedQty(r.dispatchedQty());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static OrderDetailResponse toResponse(OrderDetail e) {
        if (e == null) return null;
        return new OrderDetailResponse(
            e.getId(),
            e.getOrder() != null ? e.getOrder().getId() : null,
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getUnit() != null ? e.getUnit().getId() : null,
            e.getQuantity(),
            e.getPriceAtTime(),
            e.getLineTotal(),
            e.getDispatchedQty(),
            e.getCreatedAt()
        );
    }
}
