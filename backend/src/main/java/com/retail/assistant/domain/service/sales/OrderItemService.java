package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.OrderItem;
import java.util.List;
import java.util.Optional;

public interface OrderItemService {
    OrderItem save(OrderItem entity);
    OrderItem getById(Long id);
    Optional<OrderItem> findById(Long id);
    List<OrderItem> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
