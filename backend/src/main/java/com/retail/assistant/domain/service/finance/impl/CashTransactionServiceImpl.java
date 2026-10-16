package com.retail.assistant.domain.service.finance.impl;

import com.retail.assistant.domain.entity.finance.CashTransaction;
import com.retail.assistant.domain.repository.finance.CashTransactionRepository;
import com.retail.assistant.domain.service.finance.CashTransactionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CashTransactionServiceImpl implements CashTransactionService {

    private final CashTransactionRepository repository;

    public CashTransactionServiceImpl(CashTransactionRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public CashTransaction save(CashTransaction entity) {
        return repository.save(entity);
    }

    @Override
    public CashTransaction getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("CashTransaction not found: " + id));
    }

    @Override
    public Optional<CashTransaction> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<CashTransaction> findAll() {
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
    public List<CashTransaction> findByFundId(Long id) {
        return repository.findByFundId(id);
    }

    @Override
    public List<CashTransaction> findByFinanceLedgerId(Long id) {
        return repository.findByFinanceLedgerId(id);
    }

    @Override
    public List<CashTransaction> findByCreatedById(Long id) {
        return repository.findByCreatedById(id);
    }
}
