package com.retail.assistant.dto.inventory;

import com.retail.assistant.domain.entity.inventory.InventoryLog;
import com.retail.assistant.domain.entity.inventory.Location;
import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.ProductUnit;
import com.retail.assistant.domain.entity.inventory.StockDispatch;
import com.retail.assistant.domain.entity.supplier.StockReceipt;
import com.retail.assistant.domain.entity.system.User;

public final class InventoryLogMapper {
    private InventoryLogMapper() {}

    public static InventoryLog toEntity(InventoryLogRequest r) {
        InventoryLog e = new InventoryLog();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(InventoryLog e, InventoryLogRequest r) {
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.actionType() != null) e.setActionType(r.actionType());
        if (r.quantityChange() != null) e.setQuantityChange(r.quantityChange());
        if (r.unitId() != null) {
            ProductUnit ref = new ProductUnit();
            ref.setId(r.unitId());
            e.setUnit(ref);
        }
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.dispatchId() != null) {
            StockDispatch ref = new StockDispatch();
            ref.setId(r.dispatchId());
            e.setDispatch(ref);
        }
        if (r.receiptId() != null) {
            StockReceipt ref = new StockReceipt();
            ref.setId(r.receiptId());
            e.setReceipt(ref);
        }
        if (r.fromLocationId() != null) {
            Location ref = new Location();
            ref.setId(r.fromLocationId());
            e.setFromLocation(ref);
        }
        if (r.toLocationId() != null) {
            Location ref = new Location();
            ref.setId(r.toLocationId());
            e.setToLocation(ref);
        }
        if (r.referenceNote() != null) e.setReferenceNote(r.referenceNote());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static InventoryLogResponse toResponse(InventoryLog e) {
        if (e == null) return null;
        return new InventoryLogResponse(
            e.getId(),
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getActionType(),
            e.getQuantityChange(),
            e.getUnit() != null ? e.getUnit().getId() : null,
            e.getUser() != null ? e.getUser().getId() : null,
            e.getDispatch() != null ? e.getDispatch().getId() : null,
            e.getReceipt() != null ? e.getReceipt().getId() : null,
            e.getFromLocation() != null ? e.getFromLocation().getId() : null,
            e.getToLocation() != null ? e.getToLocation().getId() : null,
            e.getReferenceNote(),
            e.getCreatedAt()
        );
    }
}
