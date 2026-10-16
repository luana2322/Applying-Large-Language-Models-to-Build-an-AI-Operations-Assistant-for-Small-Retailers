package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.User;
import com.retail.assistant.domain.entity.system.Role;

public final class UserMapper {
    private UserMapper() {}

    public static User toEntity(UserRequest r) {
        User e = new User();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(User e, UserRequest r) {
        if (r.username() != null) e.setUsername(r.username());
        if (r.passwordHash() != null) e.setPasswordHash(r.passwordHash());
        if (r.fullName() != null) e.setFullName(r.fullName());
        if (r.email() != null) e.setEmail(r.email());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.roleId() != null) {
            Role ref = new Role();
            ref.setId(r.roleId());
            e.setRole(ref);
        }
        if (r.status() != null) e.setStatus(r.status());
        if (r.lastLogin() != null) e.setLastLogin(r.lastLogin());
        if (r.staffCode() != null) e.setStaffCode(r.staffCode());
        if (r.avatarUrl() != null) e.setAvatarUrl(r.avatarUrl());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
        if (r.deletedAt() != null) e.setDeletedAt(r.deletedAt());
    }

    public static UserResponse toResponse(User e) {
        if (e == null) return null;
        return new UserResponse(
            e.getId(),
            e.getUsername(),
            e.getFullName(),
            e.getEmail(),
            e.getPhone(),
            e.getRole() != null ? e.getRole().getId() : null,
            e.getStatus(),
            e.getLastLogin(),
            e.getStaffCode(),
            e.getAvatarUrl(),
            e.getCreatedAt(),
            e.getUpdatedAt(),
            e.getDeletedAt()
        );
    }
}
