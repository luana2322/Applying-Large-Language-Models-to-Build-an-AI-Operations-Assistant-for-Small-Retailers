package com.retail.assistant.domain.service.finance.impl;

import com.retail.assistant.domain.entity.finance.FinanceLedger;
import com.retail.assistant.domain.repository.finance.FinanceLedgerRepository;
import com.retail.assistant.domain.service.finance.FinanceLedgerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class FinanceLedgerServiceImpl implements FinanceLedgerService {

    private final FinanceLedgerRepository repository;

    public FinanceLedgerServiceImpl(FinanceLedgerRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public FinanceLedger save(FinanceLedger entity) {
        return repository.save(entity);
    }

    @Override
    public FinanceLedger getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("FinanceLedger not found: " + id));
    }

    @Override
    public Optional<FinanceLedger> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<FinanceLedger> findAll() {
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
    public List<FinanceLedger> findByCreatedById(Long id) {
        return repository.findByCreatedById(id);
    }
}
