package com.retail.assistant.dto.audit;

import java.time.LocalDateTime;

public record AuditLogResponse(Long id, String tableName, Long recordId, String action, String oldData, String newData, Long changedById, LocalDateTime changedAt) {}
