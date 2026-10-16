package com.retail.assistant.domain.service.system.impl;

import com.retail.assistant.domain.entity.system.Notification;
import com.retail.assistant.domain.repository.system.NotificationRepository;
import com.retail.assistant.domain.service.system.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    public NotificationServiceImpl(NotificationRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Notification save(Notification entity) {
        return repository.save(entity);
    }

    @Override
    public Notification getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Notification not found: " + id));
    }

    @Override
    public Optional<Notification> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Notification> findAll() {
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
    public List<Notification> findByUserId(Long id) {
        return repository.findByUserId(id);
    }
}
