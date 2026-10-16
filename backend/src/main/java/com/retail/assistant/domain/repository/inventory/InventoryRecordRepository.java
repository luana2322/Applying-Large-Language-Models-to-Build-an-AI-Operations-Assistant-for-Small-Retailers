package com.retail.assistant.domain.repository.inventory;

import com.retail.assistant.domain.entity.inventory.InventoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRecordRepository extends JpaRepository<InventoryRecord, Long> {
    List<InventoryRecord> findByStoreId(Long storeId);
    Optional<InventoryRecord> findByStoreIdAndProductId(Long storeId, Long productId);
}
