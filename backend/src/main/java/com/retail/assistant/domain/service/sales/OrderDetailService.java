package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.OrderDetail;
import java.util.List;
import java.util.Optional;

public interface OrderDetailService {
    OrderDetail save(OrderDetail entity);
    OrderDetail getById(Long id);
    Optional<OrderDetail> findById(Long id);
    List<OrderDetail> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<OrderDetail> findByOrderId(Long id);
    List<OrderDetail> findByProductId(Long id);
    List<OrderDetail> findByUnitId(Long id);
}
