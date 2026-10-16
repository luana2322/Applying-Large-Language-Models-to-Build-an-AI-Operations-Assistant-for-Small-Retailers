package com.retail.assistant.domain.repository.inventory;

import com.retail.assistant.domain.entity.inventory.StockDispatchLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockDispatchLineRepository extends JpaRepository<StockDispatchLine, Long> {
    List<StockDispatchLine> findByDispatchId(Long id);
    List<StockDispatchLine> findByProductId(Long id);
    List<StockDispatchLine> findByInventoryId(Long id);
}
