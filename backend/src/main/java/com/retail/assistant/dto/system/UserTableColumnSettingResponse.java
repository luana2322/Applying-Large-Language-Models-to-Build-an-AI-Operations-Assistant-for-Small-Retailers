package com.retail.assistant.dto.system;

import java.time.LocalDateTime;

public record UserTableColumnSettingResponse(Long id, Long userId, String tableKey, String hiddenColumns, String columnOrder, Long updatedBy, LocalDateTime createdAt, LocalDateTime updatedAt) {}
