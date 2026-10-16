package com.retail.assistant.domain.repository.inventory;

import com.retail.assistant.domain.entity.inventory.StockDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockDispatchRepository extends JpaRepository<StockDispatch, Long> {
    List<StockDispatch> findByOrderId(Long id);
    List<StockDispatch> findByUserId(Long id);
    List<StockDispatch> findByLocationId(Long id);
}
