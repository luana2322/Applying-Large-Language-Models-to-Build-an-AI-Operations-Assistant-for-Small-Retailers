package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.domain.entity.inventory.InventoryRecord;
import java.util.List;
import java.util.Optional;

public interface InventoryRecordService {
    InventoryRecord save(InventoryRecord entity);
    InventoryRecord getById(Long id);
    Optional<InventoryRecord> findById(Long id);
    List<InventoryRecord> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
