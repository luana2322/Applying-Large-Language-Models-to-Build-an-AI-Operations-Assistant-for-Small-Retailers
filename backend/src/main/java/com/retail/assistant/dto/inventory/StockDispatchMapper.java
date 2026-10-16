package com.retail.assistant.dto.inventory;

import com.retail.assistant.domain.entity.inventory.StockDispatch;
import com.retail.assistant.domain.entity.inventory.Location;
import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.entity.system.User;

public final class StockDispatchMapper {
    private StockDispatchMapper() {}

    public static StockDispatch toEntity(StockDispatchRequest r) {
        StockDispatch e = new StockDispatch();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(StockDispatch e, StockDispatchRequest r) {
        if (r.dispatchCode() != null) e.setDispatchCode(r.dispatchCode());
        if (r.orderId() != null) {
            SaleOrder ref = new SaleOrder();
            ref.setId(r.orderId());
            e.setOrder(ref);
        }
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.locationId() != null) {
            Location ref = new Location();
            ref.setId(r.locationId());
            e.setLocation(ref);
        }
        if (r.dispatchDate() != null) e.setDispatchDate(r.dispatchDate());
        if (r.status() != null) e.setStatus(r.status());
        if (r.notes() != null) e.setNotes(r.notes());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static StockDispatchResponse toResponse(StockDispatch e) {
        if (e == null) return null;
        return new StockDispatchResponse(
            e.getId(),
            e.getDispatchCode(),
            e.getOrder() != null ? e.getOrder().getId() : null,
            e.getUser() != null ? e.getUser().getId() : null,
            e.getLocation() != null ? e.getLocation().getId() : null,
            e.getDispatchDate(),
            e.getStatus(),
            e.getNotes(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
