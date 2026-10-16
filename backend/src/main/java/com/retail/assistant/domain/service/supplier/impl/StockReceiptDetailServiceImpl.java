package com.retail.assistant.domain.service.supplier.impl;

import com.retail.assistant.domain.entity.supplier.StockReceiptDetail;
import com.retail.assistant.domain.repository.supplier.StockReceiptDetailRepository;
import com.retail.assistant.domain.service.supplier.StockReceiptDetailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StockReceiptDetailServiceImpl implements StockReceiptDetailService {

    private final StockReceiptDetailRepository repository;

    public StockReceiptDetailServiceImpl(StockReceiptDetailRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public StockReceiptDetail save(StockReceiptDetail entity) {
        return repository.save(entity);
    }

    @Override
    public StockReceiptDetail getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("StockReceiptDetail not found: " + id));
    }

    @Override
    public Optional<StockReceiptDetail> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<StockReceiptDetail> findAll() {
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
    public List<StockReceiptDetail> findByReceiptId(Long id) {
        return repository.findByReceiptId(id);
    }

    @Override
    public List<StockReceiptDetail> findByProductId(Long id) {
        return repository.findByProductId(id);
    }

    @Override
    public List<StockReceiptDetail> findByUnitId(Long id) {
        return repository.findByUnitId(id);
    }
}
