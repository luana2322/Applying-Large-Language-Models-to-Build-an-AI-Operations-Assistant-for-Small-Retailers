package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.SaleOrder;
import java.util.List;
import java.util.Optional;

public interface SaleOrderService {
    SaleOrder save(SaleOrder entity);
    SaleOrder getById(Long id);
    Optional<SaleOrder> findById(Long id);
    List<SaleOrder> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<SaleOrder> findByCustomerId(Long id);
    List<SaleOrder> findByUserId(Long id);
    List<SaleOrder> findByParentOrderId(Long id);
    List<SaleOrder> findByCancelledById(Long id);
}
