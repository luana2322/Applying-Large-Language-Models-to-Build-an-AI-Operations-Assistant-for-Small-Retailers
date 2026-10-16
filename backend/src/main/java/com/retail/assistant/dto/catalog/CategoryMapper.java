package com.retail.assistant.dto.catalog;

import com.retail.assistant.domain.entity.catalog.Category;

public final class CategoryMapper {
    private CategoryMapper() {}

    public static Category toEntity(CategoryRequest r) {
        Category e = new Category();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Category e, CategoryRequest r) {
        if (r.categoryCode() != null) e.setCategoryCode(r.categoryCode());
        if (r.name() != null) e.setName(r.name());
        if (r.description() != null) e.setDescription(r.description());
        if (r.parentId() != null) {
            Category ref = new Category();
            ref.setId(r.parentId());
            e.setParent(ref);
        }
        if (r.sortOrder() != null) e.setSortOrder(r.sortOrder());
        if (r.status() != null) e.setStatus(r.status());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
        if (r.deletedAt() != null) e.setDeletedAt(r.deletedAt());
    }

    public static CategoryResponse toResponse(Category e) {
        if (e == null) return null;
        return new CategoryResponse(
            e.getId(),
            e.getCategoryCode(),
            e.getName(),
            e.getDescription(),
            e.getParent() != null ? e.getParent().getId() : null,
            e.getSortOrder(),
            e.getStatus(),
            e.getCreatedAt(),
            e.getUpdatedAt(),
            e.getDeletedAt()
        );
    }
}
