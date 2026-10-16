package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.SystemLog;
import com.retail.assistant.domain.repository.system.SystemLogRepository;
import com.retail.assistant.domain.service.system.SystemLogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class SystemLogServiceImpl implements SystemLogService {

    private final SystemLogRepository repository;

    public SystemLogServiceImpl(SystemLogRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public SystemLog save(SystemLog entity) {
        return repository.save(entity);
    }

    @Override
    public SystemLog getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("SystemLog not found: " + id));
    }

    @Override
    public Optional<SystemLog> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<SystemLog> findAll() {
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
    public List<SystemLog> findByUserId(Long id) {
        return repository.findByUserId(id);
    }
}
