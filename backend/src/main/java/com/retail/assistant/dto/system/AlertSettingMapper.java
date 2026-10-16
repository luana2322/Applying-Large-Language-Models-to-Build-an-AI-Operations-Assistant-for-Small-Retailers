package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.AlertSetting;
import com.retail.assistant.domain.entity.system.User;

public final class AlertSettingMapper {
    private AlertSettingMapper() {}

    public static AlertSetting toEntity(AlertSettingRequest r) {
        AlertSetting e = new AlertSetting();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(AlertSetting e, AlertSettingRequest r) {
        if (r.ownerId() != null) {
            User ref = new User();
            ref.setId(r.ownerId());
            e.setOwner(ref);
        }
        if (r.alertType() != null) e.setAlertType(r.alertType());
        if (r.thresholdValue() != null) e.setThresholdValue(r.thresholdValue());
        if (r.channel() != null) e.setChannel(r.channel());
        if (r.frequency() != null) e.setFrequency(r.frequency());
        if (r.isEnabled() != null) e.setIsEnabled(r.isEnabled());
        if (r.recipients() != null) e.setRecipients(r.recipients());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static AlertSettingResponse toResponse(AlertSetting e) {
        if (e == null) return null;
        return new AlertSettingResponse(
            e.getId(),
            e.getOwner() != null ? e.getOwner().getId() : null,
            e.getAlertType(),
            e.getThresholdValue(),
            e.getChannel(),
            e.getFrequency(),
            e.getIsEnabled(),
            e.getRecipients(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
