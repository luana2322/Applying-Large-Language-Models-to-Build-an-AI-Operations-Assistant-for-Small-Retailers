package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.InventoryLog;
import com.retail.assistant.domain.repository.inventory.InventoryLogRepository;
import com.retail.assistant.domain.service.inventory.InventoryLogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class InventoryLogServiceImpl implements InventoryLogService {

    private final InventoryLogRepository repository;

    public InventoryLogServiceImpl(InventoryLogRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public InventoryLog save(InventoryLog entity) {
        return repository.save(entity);
    }

    @Override
    public InventoryLog getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("InventoryLog not found: " + id));
    }

    @Override
    public Optional<InventoryLog> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<InventoryLog> findAll() {
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
    public List<InventoryLog> findByProductId(Long id) {
        return repository.findByProductId(id);
    }

    @Override
    public List<InventoryLog> findByUnitId(Long id) {
        return repository.findByUnitId(id);
    }

    @Override
    public List<InventoryLog> findByUserId(Long id) {
        return repository.findByUserId(id);
    }

    @Override
    public List<InventoryLog> findByDispatchId(Long id) {
        return repository.findByDispatchId(id);
    }

    @Override
    public List<InventoryLog> findByReceiptId(Long id) {
        return repository.findByReceiptId(id);
    }

    @Override
    public List<InventoryLog> findByFromLocationId(Long id) {
        return repository.findByFromLocationId(id);
    }

    @Override
    public List<InventoryLog> findByToLocationId(Long id) {
        return repository.findByToLocationId(id);
    }
}
