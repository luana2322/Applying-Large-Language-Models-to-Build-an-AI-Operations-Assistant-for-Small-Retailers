package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.Voucher;
import com.retail.assistant.domain.repository.sales.VoucherRepository;
import com.retail.assistant.domain.service.sales.VoucherService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository repository;

    public VoucherServiceImpl(VoucherRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Voucher save(Voucher entity) {
        return repository.save(entity);
    }

    @Override
    public Voucher getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Voucher not found: " + id));
    }

    @Override
    public Optional<Voucher> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Voucher> findAll() {
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
