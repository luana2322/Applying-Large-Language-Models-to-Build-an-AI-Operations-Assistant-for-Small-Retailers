package com.retail.assistant.dto.catalog;

import com.retail.assistant.domain.entity.catalog.ProductImage;
import com.retail.assistant.domain.entity.catalog.Product;

public final class ProductImageMapper {
    private ProductImageMapper() {}

    public static ProductImage toEntity(ProductImageRequest r) {
        ProductImage e = new ProductImage();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(ProductImage e, ProductImageRequest r) {
        if (r.productId() != null) {
            Product ref = new Product();
            ref.setId(r.productId());
            e.setProduct(ref);
        }
        if (r.imageUrl() != null) e.setImageUrl(r.imageUrl());
        if (r.altText() != null) e.setAltText(r.altText());
        if (r.isPrimary() != null) e.setIsPrimary(r.isPrimary());
        if (r.sortOrder() != null) e.setSortOrder(r.sortOrder());
        if (r.fileSizeBytes() != null) e.setFileSizeBytes(r.fileSizeBytes());
        if (r.mimeType() != null) e.setMimeType(r.mimeType());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static ProductImageResponse toResponse(ProductImage e) {
        if (e == null) return null;
        return new ProductImageResponse(
            e.getId(),
            e.getProduct() != null ? e.getProduct().getId() : null,
            e.getImageUrl(),
            e.getAltText(),
            e.getIsPrimary(),
            e.getSortOrder(),
            e.getFileSizeBytes(),
            e.getMimeType(),
            e.getCreatedAt()
        );
    }
}
