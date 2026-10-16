package com.retail.assistant.domain.service.supplier.impl;

import com.retail.assistant.domain.entity.supplier.Supplier;
import com.retail.assistant.domain.repository.supplier.SupplierRepository;
import com.retail.assistant.domain.service.supplier.SupplierService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository repository;

    public SupplierServiceImpl(SupplierRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Supplier save(Supplier entity) {
        return repository.save(entity);
    }

    @Override
    public Supplier getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + id));
    }

    @Override
    public Optional<Supplier> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Supplier> findAll() {
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
