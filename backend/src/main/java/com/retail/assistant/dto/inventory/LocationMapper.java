package com.retail.assistant.dto.inventory;

import com.retail.assistant.domain.entity.inventory.Location;

public final class LocationMapper {
    private LocationMapper() {}

    public static Location toEntity(LocationRequest r) {
        Location e = new Location();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(Location e, LocationRequest r) {
        if (r.locationCode() != null) e.setLocationCode(r.locationCode());
        if (r.name() != null) e.setName(r.name());
        if (r.address() != null) e.setAddress(r.address());
        if (r.type() != null) e.setType(r.type());
        if (r.status() != null) e.setStatus(r.status());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static LocationResponse toResponse(Location e) {
        if (e == null) return null;
        return new LocationResponse(
            e.getId(),
            e.getLocationCode(),
            e.getName(),
            e.getAddress(),
            e.getType(),
            e.getStatus(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
