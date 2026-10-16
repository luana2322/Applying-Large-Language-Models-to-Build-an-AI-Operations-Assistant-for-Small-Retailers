package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.Store;

public final class StoreMapper {
    private StoreMapper() {}

    public static Store toEntity(StoreRequest r) {
        Store e = new Store();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Store e, StoreRequest r) {
        if (r.code() != null) e.setCode(r.code());
        if (r.name() != null) e.setName(r.name());
        if (r.currency() != null) e.setCurrency(r.currency());
        if (r.timezone() != null) e.setTimezone(r.timezone());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
    }

    public static StoreResponse toResponse(Store e) {
        if (e == null) return null;
        return new StoreResponse(
            e.getId(),
            e.getCode(),
            e.getName(),
            e.getCurrency(),
            e.getTimezone(),
            e.getCreatedAt()
        );
    }
}
