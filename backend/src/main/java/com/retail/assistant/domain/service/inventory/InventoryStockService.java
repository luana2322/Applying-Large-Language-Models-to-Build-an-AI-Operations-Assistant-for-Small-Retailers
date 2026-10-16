package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.domain.entity.inventory.Inventory;
import java.util.List;
import java.util.Optional;

/**
 * CRUD service for the {@link Inventory} entity (per product/location/batch
 * stock levels). Named {@code InventoryStockService} to avoid clashing with
 * {@link InventoryService}, which is the tool-facing inventory reporting service.
 */
public interface InventoryStockService {
    Inventory save(Inventory entity);
    Inventory getById(Long id);
    Optional<Inventory> findById(Long id);
    List<Inventory> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<Inventory> findByProductId(Long id);
    List<Inventory> findByLocationId(Long id);
}
