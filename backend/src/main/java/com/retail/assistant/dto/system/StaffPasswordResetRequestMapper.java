package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.StaffPasswordResetRequest;
import com.retail.assistant.domain.entity.system.User;

public final class StaffPasswordResetRequestMapper {
    private StaffPasswordResetRequestMapper() {}

    public static StaffPasswordResetRequest toEntity(StaffPasswordResetRequestRequest r) {
        StaffPasswordResetRequest e = new StaffPasswordResetRequest();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(StaffPasswordResetRequest e, StaffPasswordResetRequestRequest r) {
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.message() != null) e.setMessage(r.message());
        if (r.status() != null) e.setStatus(r.status());
        if (r.processedById() != null) {
            User ref = new User();
            ref.setId(r.processedById());
            e.setProcessedBy(ref);
        }
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.processedAt() != null) e.setProcessedAt(r.processedAt());
    }

    public static StaffPasswordResetRequestResponse toResponse(StaffPasswordResetRequest e) {
        if (e == null) return null;
        return new StaffPasswordResetRequestResponse(
            e.getId(),
            e.getUser() != null ? e.getUser().getId() : null,
            e.getMessage(),
            e.getStatus(),
            e.getProcessedBy() != null ? e.getProcessedBy().getId() : null,
            e.getCreatedAt(),
            e.getProcessedAt()
        );
    }
}
