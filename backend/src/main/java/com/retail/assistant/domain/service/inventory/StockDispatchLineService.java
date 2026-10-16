package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.domain.entity.inventory.StockDispatchLine;
import java.util.List;
import java.util.Optional;

public interface StockDispatchLineService {
    StockDispatchLine save(StockDispatchLine entity);
    StockDispatchLine getById(Long id);
    Optional<StockDispatchLine> findById(Long id);
    List<StockDispatchLine> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<StockDispatchLine> findByDispatchId(Long id);
    List<StockDispatchLine> findByProductId(Long id);
    List<StockDispatchLine> findByInventoryId(Long id);
}
