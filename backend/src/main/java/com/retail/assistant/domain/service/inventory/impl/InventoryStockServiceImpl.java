package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.Inventory;
import com.retail.assistant.domain.repository.inventory.InventoryRepository;
import com.retail.assistant.domain.service.inventory.InventoryStockService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class InventoryStockServiceImpl implements InventoryStockService {

    private final InventoryRepository repository;

    public InventoryStockServiceImpl(InventoryRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Inventory save(Inventory entity) {
        return repository.save(entity);
    }

    @Override
    public Inventory getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Inventory not found: " + id));
    }

    @Override
    public Optional<Inventory> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Inventory> findAll() {
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

    @Override
    public List<Inventory> findByProductId(Long id) {
        return repository.findByProductId(id);
    }

    @Override
    public List<Inventory> findByLocationId(Long id) {
        return repository.findByLocationId(id);
    }
}
