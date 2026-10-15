package com.retail.assistant.dto;

import java.time.Instant;
import java.util.Map;

public record ToolResponse<T>(
    boolean success,
    T data,
    Metadata metadata,
    ToolError error
) {
    public static <T> ToolResponse<T> ok(Long storeId, T data, boolean dataComplete) {
        return new ToolResponse<>(
            true,
            data,
            new Metadata(String.valueOf(storeId), Instant.now().toString(), dataComplete),
            null
        );
    }

    public static <T> ToolResponse<T> fail(String code, String message) {
        return new ToolResponse<>(
            false,
            null,
            new Metadata(null, Instant.now().toString(), false),
            new ToolError(code, message)
        );
    }

    public record Metadata(String store_id, String generated_at, boolean data_complete) {}
    public record ToolError(String code, String message) {}
}
