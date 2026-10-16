package com.retail.assistant.domain.service.sales.impl;

import com.retail.assistant.domain.entity.sales.Customer;
import com.retail.assistant.domain.repository.sales.CustomerRepository;
import com.retail.assistant.domain.service.sales.CustomerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;

    public CustomerServiceImpl(CustomerRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Customer save(Customer entity) {
        return repository.save(entity);
    }

    @Override
    public Customer getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
    }

    @Override
    public Optional<Customer> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Customer> findAll() {
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
