package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.User;
import com.retail.assistant.domain.repository.system.UserRepository;
import com.retail.assistant.domain.service.system.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    public UserServiceImpl(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public User save(User entity) {
        return repository.save(entity);
    }

    @Override
    public User getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    @Override
    public Optional<User> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<User> findAll() {
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
    public List<User> findByRoleId(Long id) {
        return repository.findByRoleId(id);
    }
}
