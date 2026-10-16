package com.retail.assistant.dto.catalog;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.catalog.Category;

public final class ProductMapper {
    private ProductMapper() {}

    public static Product toEntity(ProductRequest r) {
        Product e = new Product();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Product e, ProductRequest r) {
        if (r.categoryId() != null) {
            Category ref = new Category();
            ref.setId(r.categoryId());
            e.setCategoryEntity(ref);
        }
        if (r.sku() != null) e.setSku(r.sku());
        if (r.barcode() != null) e.setBarcode(r.barcode());
        if (r.name() != null) e.setName(r.name());
        if (r.imageUrl() != null) e.setImageUrl(r.imageUrl());
        if (r.description() != null) e.setDescription(r.description());
        if (r.weight() != null) e.setWeight(r.weight());
        if (r.status() != null) e.setStatus(r.status());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
        if (r.deletedAt() != null) e.setDeletedAt(r.deletedAt());
        if (r.storeId() != null) e.setStoreId(r.storeId());
        if (r.unit() != null) e.setUnit(r.unit());
        if (r.costPrice() != null) e.setCostPrice(r.costPrice());
        if (r.sellingPrice() != null) e.setSellingPrice(r.sellingPrice());
        if (r.minStockLevel() != null) e.setMinStockLevel(r.minStockLevel());
        if (r.categoryName() != null) e.setCategoryName(r.categoryName());
    }

    public static ProductResponse toResponse(Product e) {
        if (e == null) return null;
        return new ProductResponse(
            e.getId(),
            e.getCategoryEntity() != null ? e.getCategoryEntity().getId() : null,
            e.getSku(),
            e.getBarcode(),
            e.getName(),
            e.getImageUrl(),
            e.getDescription(),
            e.getWeight(),
            e.getStatus(),
            e.getCreatedAt(),
            e.getUpdatedAt(),
            e.getDeletedAt(),
            e.getStoreId(),
            e.getUnit(),
            e.getCostPrice(),
            e.getSellingPrice(),
            e.getMinStockLevel(),
            e.getCategoryName()
        );
    }
}
