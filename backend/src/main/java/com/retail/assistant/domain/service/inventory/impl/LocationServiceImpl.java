package com.retail.assistant.domain.service.inventory.impl;

import com.retail.assistant.domain.entity.inventory.Location;
import com.retail.assistant.domain.repository.inventory.LocationRepository;
import com.retail.assistant.domain.service.inventory.LocationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {

    private final LocationRepository repository;

    public LocationServiceImpl(LocationRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Location save(Location entity) {
        return repository.save(entity);
    }

    @Override
    public Location getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Location not found: " + id));
    }

    @Override
    public Optional<Location> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Location> findAll() {
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
