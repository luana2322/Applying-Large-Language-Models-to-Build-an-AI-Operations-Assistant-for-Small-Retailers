package com.retail.assistant.dto.supplier;

import com.retail.assistant.domain.entity.supplier.StockReceiptDetail;
import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.ProductUnit;
import com.retail.assistant.domain.entity.supplier.StockReceipt;

public final class StockReceiptDetailMapper {
    private StockReceiptDetailMapper() {}

    public static StockReceiptDetail toEntity(StockReceiptDetailRequest r) {
        StockReceiptDetail e = new StockReceiptDetail();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(StockReceiptDetail e, StockReceiptDetailRequest r) {
        if (r.receiptId() != null) {
            StockReceipt ref = new StockReceipt();
            ref.setId(r.receiptId());
            e.setReceipt(ref);
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
        if (r.costPrice() != null) e.setCostPrice(r.costPrice());
        if (r.batchNumber() != null) e.setBatchNumber(r.batchNumber());
        if (r.expiryDate() != null) e.setExpiryDate(r.expiryDate());
        if (r.lineTotal() != null) e.setLineTotal(r.lineTotal());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static StockReceiptDetailResponse toResponse(StockReceiptDetail e) {
        if (e == null) return null;
        return new StockReceiptDetailResponse(
            e.getId(),
            e.getReceipt() != null ? e.getReceipt().getId() : null,
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getUnit() != null ? e.getUnit().getId() : null,
            e.getQuantity(),
            e.getCostPrice(),
            e.getBatchNumber(),
            e.getExpiryDate(),
            e.getLineTotal(),
            e.getCreatedAt()
        );
    }
}
