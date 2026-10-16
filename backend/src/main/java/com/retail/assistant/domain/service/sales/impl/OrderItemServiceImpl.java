package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.OrderItem;
import com.retail.assistant.domain.repository.sales.OrderItemRepository;
import com.retail.assistant.domain.service.sales.OrderItemService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository repository;

    public OrderItemServiceImpl(OrderItemRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public OrderItem save(OrderItem entity) {
        return repository.save(entity);
    }

    @Override
    public OrderItem getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("OrderItem not found: " + id));
    }

    @Override
    public Optional<OrderItem> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<OrderItem> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
}
