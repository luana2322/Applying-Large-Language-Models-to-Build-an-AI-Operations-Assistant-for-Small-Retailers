package com.retail.assistant.domain.service.audit.impl;

import com.retail.assistant.domain.entity.audit.AuditLog;
import com.retail.assistant.domain.repository.audit.AuditLogRepository;
import com.retail.assistant.domain.service.audit.AuditLogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogServiceImpl(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public AuditLog save(AuditLog entity) {
        return repository.save(entity);
    }

    @Override
    public AuditLog getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("AuditLog not found: " + id));
    }

    @Override
    public Optional<AuditLog> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<AuditLog> findAll() {
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
    public List<AuditLog> findByChangedById(Long id) {
        return repository.findByChangedById(id);
    }
}
