package com.retail.assistant.dto.inventory;

import com.retail.assistant.domain.entity.inventory.StockDispatchLine;
import com.retail.assistant.domain.entity.inventory.Inventory;
import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.inventory.StockDispatch;

public final class StockDispatchLineMapper {
    private StockDispatchLineMapper() {}

    public static StockDispatchLine toEntity(StockDispatchLineRequest r) {
        StockDispatchLine e = new StockDispatchLine();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(StockDispatchLine e, StockDispatchLineRequest r) {
        if (r.dispatchId() != null) {
            StockDispatch ref = new StockDispatch();
            ref.setId(r.dispatchId());
            e.setDispatch(ref);
        }
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.inventoryId() != null) {
            Inventory ref = new Inventory();
            ref.setId(r.inventoryId());
            e.setInventory(ref);
        }
        if (r.quantity() != null) e.setQuantity(r.quantity());
        if (r.unitPriceSnapshot() != null) e.setUnitPriceSnapshot(r.unitPriceSnapshot());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static StockDispatchLineResponse toResponse(StockDispatchLine e) {
        if (e == null) return null;
        return new StockDispatchLineResponse(
            e.getId(),
            e.getDispatch() != null ? e.getDispatch().getId() : null,
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getInventory() != null ? e.getInventory().getId() : null,
            e.getQuantity(),
            e.getUnitPriceSnapshot(),
            e.getCreatedAt()
        );
    }
}
