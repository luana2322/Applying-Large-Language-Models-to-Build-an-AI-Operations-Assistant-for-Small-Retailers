package com.retail.assistant.domain.service.finance.impl;

import com.retail.assistant.domain.entity.finance.CashFund;
import com.retail.assistant.domain.repository.finance.CashFundRepository;
import com.retail.assistant.domain.service.finance.CashFundService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CashFundServiceImpl implements CashFundService {

    private final CashFundRepository repository;

    public CashFundServiceImpl(CashFundRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public CashFund save(CashFund entity) {
        return repository.save(entity);
    }

    @Override
    public CashFund getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("CashFund not found: " + id));
    }

    @Override
    public Optional<CashFund> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<CashFund> findAll() {
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
