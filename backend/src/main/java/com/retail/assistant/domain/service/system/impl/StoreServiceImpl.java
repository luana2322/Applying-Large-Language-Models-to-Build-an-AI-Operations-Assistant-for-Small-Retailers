package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.Store;
import com.retail.assistant.domain.repository.system.StoreRepository;
import com.retail.assistant.domain.service.system.StoreService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StoreServiceImpl implements StoreService {

    private final StoreRepository repository;

    public StoreServiceImpl(StoreRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Store save(Store entity) {
        return repository.save(entity);
    }

    @Override
    public Store getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Store not found: " + id));
    }

    @Override
    public Optional<Store> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Store> findAll() {
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
