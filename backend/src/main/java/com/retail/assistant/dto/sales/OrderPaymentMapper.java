package com.retail.assistant.dto.sales;

import com.retail.assistant.domain.entity.sales.OrderPayment;
import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.entity.system.User;

public final class OrderPaymentMapper {
    private OrderPaymentMapper() {}

    public static OrderPayment toEntity(OrderPaymentRequest r) {
        OrderPayment e = new OrderPayment();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(OrderPayment e, OrderPaymentRequest r) {
        if (r.orderId() != null) {
            SaleOrder ref = new SaleOrder();
            ref.setId(r.orderId());
            e.setOrder(ref);
        }
        if (r.paymentCode() != null) e.setPaymentCode(r.paymentCode());
        if (r.method() != null) e.setMethod(r.method());
        if (r.amount() != null) e.setAmount(r.amount());
        if (r.transactionRef() != null) e.setTransactionRef(r.transactionRef());
        if (r.status() != null) e.setStatus(r.status());
        if (r.paidAt() != null) e.setPaidAt(r.paidAt());
        if (r.notes() != null) e.setNotes(r.notes());
        if (r.createdById() != null) {
            User ref = new User();
            ref.setId(r.createdById());
            e.setCreatedBy(ref);
        }
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static OrderPaymentResponse toResponse(OrderPayment e) {
        if (e == null) return null;
        return new OrderPaymentResponse(
            e.getId(),
            e.getOrder() != null ? e.getOrder().getId() : null,
            e.getPaymentCode(),
            e.getMethod(),
            e.getAmount(),
            e.getTransactionRef(),
            e.getStatus(),
            e.getPaidAt(),
            e.getNotes(),
            e.getCreatedBy() != null ? e.getCreatedBy().getId() : null,
            e.getCreatedAt()
        );
    }
}
