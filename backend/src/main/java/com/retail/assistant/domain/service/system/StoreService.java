package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.Store;
import java.util.List;
import java.util.Optional;

public interface StoreService {
    Store save(Store entity);
    Store getById(Long id);
    Optional<Store> findById(Long id);
    List<Store> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
