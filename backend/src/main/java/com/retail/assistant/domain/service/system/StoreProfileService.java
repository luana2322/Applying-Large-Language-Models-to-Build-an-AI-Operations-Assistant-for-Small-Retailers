package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.StoreProfile;
import java.util.List;
import java.util.Optional;

public interface StoreProfileService {
    StoreProfile save(StoreProfile entity);
    StoreProfile getById(Long id);
    Optional<StoreProfile> findById(Long id);
    List<StoreProfile> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<StoreProfile> findByOwnerId(Long id);
}
