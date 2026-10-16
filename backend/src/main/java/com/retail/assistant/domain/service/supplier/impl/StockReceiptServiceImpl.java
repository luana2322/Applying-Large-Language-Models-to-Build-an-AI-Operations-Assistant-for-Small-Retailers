package com.retail.assistant.domain.service.supplier.impl;

import com.retail.assistant.domain.entity.supplier.StockReceipt;
import com.retail.assistant.domain.repository.supplier.StockReceiptRepository;
import com.retail.assistant.domain.service.supplier.StockReceiptService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StockReceiptServiceImpl implements StockReceiptService {

    private final StockReceiptRepository repository;

    public StockReceiptServiceImpl(StockReceiptRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public StockReceipt save(StockReceipt entity) {
        return repository.save(entity);
    }

    @Override
    public StockReceipt getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("StockReceipt not found: " + id));
    }

    @Override
    public Optional<StockReceipt> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<StockReceipt> findAll() {
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
    public List<StockReceipt> findBySupplierId(Long id) {
        return repository.findBySupplierId(id);
    }

    @Override
    public List<StockReceipt> findByStaffId(Long id) {
        return repository.findByStaffId(id);
    }

    @Override
    public List<StockReceipt> findByApprovedById(Long id) {
        return repository.findByApprovedById(id);
    }
}
