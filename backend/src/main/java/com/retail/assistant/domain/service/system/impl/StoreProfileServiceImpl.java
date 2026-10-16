package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.StoreProfile;
import com.retail.assistant.domain.repository.system.StoreProfileRepository;
import com.retail.assistant.domain.service.system.StoreProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StoreProfileServiceImpl implements StoreProfileService {

    private final StoreProfileRepository repository;

    public StoreProfileServiceImpl(StoreProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public StoreProfile save(StoreProfile entity) {
        return repository.save(entity);
    }

    @Override
    public StoreProfile getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("StoreProfile not found: " + id));
    }

    @Override
    public Optional<StoreProfile> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<StoreProfile> findAll() {
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
    public List<StoreProfile> findByOwnerId(Long id) {
        return repository.findByOwnerId(id);
    }
}
