package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.StaffPasswordResetRequest;
import com.retail.assistant.domain.repository.system.StaffPasswordResetRequestRepository;
import com.retail.assistant.domain.service.system.StaffPasswordResetRequestService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StaffPasswordResetRequestServiceImpl implements StaffPasswordResetRequestService {

    private final StaffPasswordResetRequestRepository repository;

    public StaffPasswordResetRequestServiceImpl(StaffPasswordResetRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public StaffPasswordResetRequest save(StaffPasswordResetRequest entity) {
        return repository.save(entity);
    }

    @Override
    public StaffPasswordResetRequest getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("StaffPasswordResetRequest not found: " + id));
    }

    @Override
    public Optional<StaffPasswordResetRequest> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<StaffPasswordResetRequest> findAll() {
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
    public List<StaffPasswordResetRequest> findByUserId(Long id) {
        return repository.findByUserId(id);
    }

    @Override
    public List<StaffPasswordResetRequest> findByProcessedById(Long id) {
        return repository.findByProcessedById(id);
    }
}
