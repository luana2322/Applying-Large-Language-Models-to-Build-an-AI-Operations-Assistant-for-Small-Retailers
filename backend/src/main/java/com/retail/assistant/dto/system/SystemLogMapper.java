package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.SystemLog;
import com.retail.assistant.domain.entity.system.User;

public final class SystemLogMapper {
    private SystemLogMapper() {}

    public static SystemLog toEntity(SystemLogRequest r) {
        SystemLog e = new SystemLog();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(SystemLog e, SystemLogRequest r) {
        if (r.logLevel() != null) e.setLogLevel(r.logLevel());
        if (r.module() != null) e.setModule(r.module());
        if (r.action() != null) e.setAction(r.action());
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.message() != null) e.setMessage(r.message());
        if (r.stackTrace() != null) e.setStackTrace(r.stackTrace());
        if (r.contextData() != null) e.setContextData(r.contextData());
        if (r.ipAddress() != null) e.setIpAddress(r.ipAddress());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static SystemLogResponse toResponse(SystemLog e) {
        if (e == null) return null;
        return new SystemLogResponse(
            e.getId(),
            e.getLogLevel(),
            e.getModule(),
            e.getAction(),
            e.getUser() != null ? e.getUser().getId() : null,
            e.getMessage(),
            e.getStackTrace(),
            e.getContextData(),
            e.getIpAddress(),
            e.getCreatedAt()
        );
    }
}
