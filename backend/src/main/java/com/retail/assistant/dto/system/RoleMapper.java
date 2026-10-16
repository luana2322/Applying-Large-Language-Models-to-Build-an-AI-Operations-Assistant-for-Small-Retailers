package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.Role;

public final class RoleMapper {
    private RoleMapper() {}

    public static Role toEntity(RoleRequest r) {
        Role e = new Role();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Role e, RoleRequest r) {
        if (r.name() != null) e.setName(r.name());
        if (r.description() != null) e.setDescription(r.description());
        if (r.permission() != null) e.setPermission(r.permission());
        if (r.isSystem() != null) e.setIsSystem(r.isSystem());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static RoleResponse toResponse(Role e) {
        if (e == null) return null;
        return new RoleResponse(
            e.getId(),
            e.getName(),
            e.getDescription(),
            e.getPermission(),
            e.getIsSystem(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
