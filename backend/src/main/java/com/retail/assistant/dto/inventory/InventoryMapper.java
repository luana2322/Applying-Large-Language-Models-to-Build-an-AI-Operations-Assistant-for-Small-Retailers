package com.retail.assistant.dto.inventory;

import com.retail.assistant.domain.entity.inventory.Inventory;
import com.retail.assistant.domain.entity.inventory.Location;
import com.retail.assistant.domain.entity.catalog.Product;

public final class InventoryMapper {
    private InventoryMapper() {}

    public static Inventory toEntity(InventoryRequest r) {
        Inventory e = new Inventory();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Inventory e, InventoryRequest r) {
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.locationId() != null) {
            Location ref = new Location();
            ref.setId(r.locationId());
            e.setLocation(ref);
        }
        if (r.batchNumber() != null) e.setBatchNumber(r.batchNumber());
        if (r.expiryDate() != null) e.setExpiryDate(r.expiryDate());
        if (r.quantity() != null) e.setQuantity(r.quantity());
        if (r.minQuantity() != null) e.setMinQuantity(r.minQuantity());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static InventoryResponse toResponse(Inventory e) {
        if (e == null) return null;
        return new InventoryResponse(
            e.getId(),
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getLocation() != null ? e.getLocation().getId() : null,
            e.getBatchNumber(),
            e.getExpiryDate(),
            e.getQuantity(),
            e.getMinQuantity(),
            e.getUpdatedAt()
        );
    }
}
