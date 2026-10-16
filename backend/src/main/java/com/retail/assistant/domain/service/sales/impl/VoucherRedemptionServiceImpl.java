package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.VoucherRedemption;
import com.retail.assistant.domain.repository.sales.VoucherRedemptionRepository;
import com.retail.assistant.domain.service.sales.VoucherRedemptionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class VoucherRedemptionServiceImpl implements VoucherRedemptionService {

    private final VoucherRedemptionRepository repository;

    public VoucherRedemptionServiceImpl(VoucherRedemptionRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public VoucherRedemption save(VoucherRedemption entity) {
        return repository.save(entity);
    }

    @Override
    public VoucherRedemption getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("VoucherRedemption not found: " + id));
    }

    @Override
    public Optional<VoucherRedemption> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<VoucherRedemption> findAll() {
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
    public List<VoucherRedemption> findByVoucherId(Long id) {
        return repository.findByVoucherId(id);
    }

    @Override
    public List<VoucherRedemption> findBySaleOrderId(Long id) {
        return repository.findBySaleOrderId(id);
    }
}
