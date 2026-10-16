package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.Notification;
import com.retail.assistant.domain.entity.system.User;

public final class NotificationMapper {
    private NotificationMapper() {}

    public static Notification toEntity(NotificationRequest r) {
        Notification e = new Notification();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Notification e, NotificationRequest r) {
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.notificationType() != null) e.setNotificationType(r.notificationType());
        if (r.title() != null) e.setTitle(r.title());
        if (r.message() != null) e.setMessage(r.message());
        if (r.isRead() != null) e.setIsRead(r.isRead());
        if (r.referenceType() != null) e.setReferenceType(r.referenceType());
        if (r.referenceId() != null) e.setReferenceId(r.referenceId());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.readAt() != null) e.setReadAt(r.readAt());
    }

    public static NotificationResponse toResponse(Notification e) {
        if (e == null) return null;
        return new NotificationResponse(
            e.getId(),
            e.getUser() != null ? e.getUser().getId() : null,
            e.getNotificationType(),
            e.getTitle(),
            e.getMessage(),
            e.getIsRead(),
            e.getReferenceType(),
            e.getReferenceId(),
            e.getCreatedAt(),
            e.getReadAt()
        );
    }
}
