package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.domain.entity.inventory.StockDispatch;
import java.util.List;
import java.util.Optional;

public interface StockDispatchService {
    StockDispatch save(StockDispatch entity);
    StockDispatch getById(Long id);
    Optional<StockDispatch> findById(Long id);
    List<StockDispatch> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<StockDispatch> findByOrderId(Long id);
    List<StockDispatch> findByUserId(Long id);
    List<StockDispatch> findByLocationId(Long id);
}
