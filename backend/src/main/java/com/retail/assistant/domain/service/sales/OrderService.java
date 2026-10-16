package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.Order;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order save(Order entity);
    Order getById(Long id);
    Optional<Order> findById(Long id);
    List<Order> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
