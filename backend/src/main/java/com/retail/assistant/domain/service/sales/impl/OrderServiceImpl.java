package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.Order;
import com.retail.assistant.domain.repository.sales.OrderRepository;
import com.retail.assistant.domain.service.sales.OrderService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;

    public OrderServiceImpl(OrderRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Order save(Order entity) {
        return repository.save(entity);
    }

    @Override
    public Order getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
    }

    @Override
    public Optional<Order> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Order> findAll() {
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
