package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.InventoryRecord;
import com.retail.assistant.domain.repository.inventory.InventoryRecordRepository;
import com.retail.assistant.domain.service.inventory.InventoryRecordService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class InventoryRecordServiceImpl implements InventoryRecordService {

    private final InventoryRecordRepository repository;

    public InventoryRecordServiceImpl(InventoryRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public InventoryRecord save(InventoryRecord entity) {
        return repository.save(entity);
    }

    @Override
    public InventoryRecord getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("InventoryRecord not found: " + id));
    }

    @Override
    public Optional<InventoryRecord> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<InventoryRecord> findAll() {
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
