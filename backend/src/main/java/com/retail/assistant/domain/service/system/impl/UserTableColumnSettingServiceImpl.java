package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.UserTableColumnSetting;
import com.retail.assistant.domain.repository.system.UserTableColumnSettingRepository;
import com.retail.assistant.domain.service.system.UserTableColumnSettingService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserTableColumnSettingServiceImpl implements UserTableColumnSettingService {

    private final UserTableColumnSettingRepository repository;

    public UserTableColumnSettingServiceImpl(UserTableColumnSettingRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public UserTableColumnSetting save(UserTableColumnSetting entity) {
        return repository.save(entity);
    }

    @Override
    public UserTableColumnSetting getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("UserTableColumnSetting not found: " + id));
    }

    @Override
    public Optional<UserTableColumnSetting> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<UserTableColumnSetting> findAll() {
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
    public List<UserTableColumnSetting> findByUserId(Long id) {
        return repository.findByUserId(id);
    }
}
