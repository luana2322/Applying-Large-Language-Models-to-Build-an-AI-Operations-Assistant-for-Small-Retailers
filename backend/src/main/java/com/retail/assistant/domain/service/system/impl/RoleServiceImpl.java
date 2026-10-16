package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.Role;
import com.retail.assistant.domain.repository.system.RoleRepository;
import com.retail.assistant.domain.service.system.RoleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;

    public RoleServiceImpl(RoleRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Role save(Role entity) {
        return repository.save(entity);
    }

    @Override
    public Role getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Role not found: " + id));
    }

    @Override
    public Optional<Role> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Role> findAll() {
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
