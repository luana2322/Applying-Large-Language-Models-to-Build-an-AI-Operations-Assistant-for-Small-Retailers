package com.retail.assistant.dto.catalog;

import com.retail.assistant.domain.entity.catalog.ProductPriceHistory;
import com.retail.assistant.domain.entity.catalog.Product;

public final class ProductPriceHistoryMapper {
    private ProductPriceHistoryMapper() {}

    public static ProductPriceHistory toEntity(ProductPriceHistoryRequest r) {
        ProductPriceHistory e = new ProductPriceHistory();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(ProductPriceHistory e, ProductPriceHistoryRequest r) {
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.costPrice() != null) e.setCostPrice(r.costPrice());
        if (r.salePrice() != null) e.setSalePrice(r.salePrice());
        if (r.effectiveDate() != null) e.setEffectiveDate(r.effectiveDate());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static ProductPriceHistoryResponse toResponse(ProductPriceHistory e) {
        if (e == null) return null;
        return new ProductPriceHistoryResponse(
            e.getId(),
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getCostPrice(),
            e.getSalePrice(),
            e.getEffectiveDate(),
            e.getCreatedAt()
        );
    }
}
