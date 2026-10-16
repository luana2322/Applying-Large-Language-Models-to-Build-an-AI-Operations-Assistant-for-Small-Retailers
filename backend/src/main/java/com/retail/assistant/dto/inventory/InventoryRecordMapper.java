package com.retail.assistant.dto.inventory;

import com.retail.assistant.domain.entity.inventory.InventoryRecord;
import com.retail.assistant.domain.entity.catalog.Product;

public final class InventoryRecordMapper {
    private InventoryRecordMapper() {}

    public static InventoryRecord toEntity(InventoryRecordRequest r) {
        InventoryRecord e = new InventoryRecord();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(InventoryRecord e, InventoryRecordRequest r) {
        if (r.storeId() != null) e.setStoreId(r.storeId());
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.currentStock() != null) e.setCurrentStock(r.currentStock());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static InventoryRecordResponse toResponse(InventoryRecord e) {
        if (e == null) return null;
        return new InventoryRecordResponse(
            e.getId(),
            e.getStoreId(),
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getCurrentStock(),
            e.getUpdatedAt()
        );
    }
}
