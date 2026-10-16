package com.retail.assistant.domain.repository.inventory;

import com.retail.assistant.domain.entity.inventory.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {
    List<InventoryLog> findByProductId(Long id);
    List<InventoryLog> findByUnitId(Long id);
    List<InventoryLog> findByUserId(Long id);
    List<InventoryLog> findByDispatchId(Long id);
    List<InventoryLog> findByReceiptId(Long id);
    List<InventoryLog> findByFromLocationId(Long id);
    List<InventoryLog> findByToLocationId(Long id);
}
