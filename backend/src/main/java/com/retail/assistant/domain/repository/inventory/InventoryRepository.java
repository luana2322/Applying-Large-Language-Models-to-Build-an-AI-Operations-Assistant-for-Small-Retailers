package com.retail.assistant.domain.repository.inventory;

import com.retail.assistant.domain.entity.inventory.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByProductId(Long id);
    List<Inventory> findByLocationId(Long id);
}
