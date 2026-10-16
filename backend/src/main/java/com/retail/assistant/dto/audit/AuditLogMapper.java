package com.retail.assistant.dto.audit;

import com.retail.assistant.domain.entity.audit.AuditLog;
import com.retail.assistant.domain.entity.system.User;

public final class AuditLogMapper {
    private AuditLogMapper() {}

    public static AuditLog toEntity(AuditLogRequest r) {
        AuditLog e = new AuditLog();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(AuditLog e, AuditLogRequest r) {
        if (r.tableName() != null) e.setTableName(r.tableName());
        if (r.recordId() != null) e.setRecordId(r.recordId());
        if (r.action() != null) e.setAction(r.action());
        if (r.oldData() != null) e.setOldData(r.oldData());
        if (r.newData() != null) e.setNewData(r.newData());
        if (r.changedById() != null) {
            User ref = new User();
            ref.setId(r.changedById());
            e.setChangedBy(ref);
        }
        if (r.changedAt() != null) e.setChangedAt(r.changedAt());
    }

    public static AuditLogResponse toResponse(AuditLog e) {
        if (e == null) return null;
        return new AuditLogResponse(
            e.getId(),
            e.getTableName(),
            e.getRecordId(),
            e.getAction(),
            e.getOldData(),
            e.getNewData(),
            e.getChangedBy() != null ? e.getChangedBy().getId() : null,
            e.getChangedAt()
        );
    }
}
