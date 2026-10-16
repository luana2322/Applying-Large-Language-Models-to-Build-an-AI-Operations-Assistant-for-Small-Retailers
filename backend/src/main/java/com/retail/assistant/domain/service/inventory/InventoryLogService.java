package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.domain.entity.inventory.InventoryLog;
import java.util.List;
import java.util.Optional;

public interface InventoryLogService {
    InventoryLog save(InventoryLog entity);
    InventoryLog getById(Long id);
    Optional<InventoryLog> findById(Long id);
    List<InventoryLog> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<InventoryLog> findByProductId(Long id);
    List<InventoryLog> findByUnitId(Long id);
    List<InventoryLog> findByUserId(Long id);
    List<InventoryLog> findByDispatchId(Long id);
    List<InventoryLog> findByReceiptId(Long id);
    List<InventoryLog> findByFromLocationId(Long id);
    List<InventoryLog> findByToLocationId(Long id);
}
