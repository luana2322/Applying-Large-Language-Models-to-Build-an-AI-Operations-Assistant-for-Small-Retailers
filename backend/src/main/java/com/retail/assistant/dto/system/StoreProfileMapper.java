package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.StoreProfile;
import com.retail.assistant.domain.entity.system.User;

public final class StoreProfileMapper {
    private StoreProfileMapper() {}

    public static StoreProfile toEntity(StoreProfileRequest r) {
        StoreProfile e = new StoreProfile();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(StoreProfile e, StoreProfileRequest r) {
        if (r.ownerId() != null) {
            User ref = new User();
            ref.setId(r.ownerId());
            e.setOwner(ref);
        }
        if (r.name() != null) e.setName(r.name());
        if (r.businessCategory() != null) e.setBusinessCategory(r.businessCategory());
        if (r.address() != null) e.setAddress(r.address());
        if (r.phone() != null) e.setPhone(r.phone());
        if (r.email() != null) e.setEmail(r.email());
        if (r.website() != null) e.setWebsite(r.website());
        if (r.taxCode() != null) e.setTaxCode(r.taxCode());
        if (r.logoUrl() != null) e.setLogoUrl(r.logoUrl());
        if (r.currency() != null) e.setCurrency(r.currency());
        if (r.timezone() != null) e.setTimezone(r.timezone());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static StoreProfileResponse toResponse(StoreProfile e) {
        if (e == null) return null;
        return new StoreProfileResponse(
            e.getId(),
            e.getOwner() != null ? e.getOwner().getId() : null,
            e.getName(),
            e.getBusinessCategory(),
            e.getAddress(),
            e.getPhone(),
            e.getEmail(),
            e.getWebsite(),
            e.getTaxCode(),
            e.getLogoUrl(),
            e.getCurrency(),
            e.getTimezone(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
