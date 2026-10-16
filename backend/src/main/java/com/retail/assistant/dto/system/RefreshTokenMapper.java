package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.RefreshToken;
import com.retail.assistant.domain.entity.system.User;

public final class RefreshTokenMapper {
    private RefreshTokenMapper() {}

    public static RefreshToken toEntity(RefreshTokenRequest r) {
        RefreshToken e = new RefreshToken();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(RefreshToken e, RefreshTokenRequest r) {
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.token() != null) e.setToken(r.token());
        if (r.expiresAt() != null) e.setExpiresAt(r.expiresAt());
        if (r.userAgent() != null) e.setUserAgent(r.userAgent());
        if (r.ipAddress() != null) e.setIpAddress(r.ipAddress());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.deletedAt() != null) e.setDeletedAt(r.deletedAt());
    }

    public static RefreshTokenResponse toResponse(RefreshToken e) {
        if (e == null) return null;
        return new RefreshTokenResponse(
            e.getId(),
            e.getUser() != null ? e.getUser().getId() : null,
            e.getExpiresAt(),
            e.getUserAgent(),
            e.getIpAddress(),
            e.getCreatedAt(),
            e.getDeletedAt()
        );
    }
}
