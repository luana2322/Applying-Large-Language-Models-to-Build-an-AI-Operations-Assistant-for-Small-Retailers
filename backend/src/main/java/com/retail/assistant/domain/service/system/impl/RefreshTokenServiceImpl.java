package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.RefreshToken;
import com.retail.assistant.domain.repository.system.RefreshTokenRepository;
import com.retail.assistant.domain.service.system.RefreshTokenService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repository;

    public RefreshTokenServiceImpl(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public RefreshToken save(RefreshToken entity) {
        return repository.save(entity);
    }

    @Override
    public RefreshToken getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("RefreshToken not found: " + id));
    }

    @Override
    public Optional<RefreshToken> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<RefreshToken> findAll() {
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
    public List<RefreshToken> findByUserId(Long id) {
        return repository.findByUserId(id);
    }
}
