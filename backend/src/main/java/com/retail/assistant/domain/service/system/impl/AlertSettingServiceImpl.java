package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.AlertSetting;
import com.retail.assistant.domain.repository.system.AlertSettingRepository;
import com.retail.assistant.domain.service.system.AlertSettingService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class AlertSettingServiceImpl implements AlertSettingService {

    private final AlertSettingRepository repository;

    public AlertSettingServiceImpl(AlertSettingRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public AlertSetting save(AlertSetting entity) {
        return repository.save(entity);
    }

    @Override
    public AlertSetting getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("AlertSetting not found: " + id));
    }

    @Override
    public Optional<AlertSetting> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<AlertSetting> findAll() {
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
    public List<AlertSetting> findByOwnerId(Long id) {
        return repository.findByOwnerId(id);
    }
}
