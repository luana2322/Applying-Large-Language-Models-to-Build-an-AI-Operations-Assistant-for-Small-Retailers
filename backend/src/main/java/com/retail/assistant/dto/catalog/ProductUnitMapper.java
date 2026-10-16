package com.retail.assistant.dto.catalog;

import com.retail.assistant.domain.entity.catalog.ProductUnit;
import com.retail.assistant.domain.entity.catalog.Product;

public final class ProductUnitMapper {
    private ProductUnitMapper() {}

    public static ProductUnit toEntity(ProductUnitRequest r) {
        ProductUnit e = new ProductUnit();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(ProductUnit e, ProductUnitRequest r) {
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.unitName() != null) e.setUnitName(r.unitName());
        if (r.conversionRate() != null) e.setConversionRate(r.conversionRate());
        if (r.isBaseUnit() != null) e.setIsBaseUnit(r.isBaseUnit());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static ProductUnitResponse toResponse(ProductUnit e) {
        if (e == null) return null;
        return new ProductUnitResponse(
            e.getId(),
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getUnitName(),
            e.getConversionRate(),
            e.getIsBaseUnit(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
