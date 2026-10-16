package com.retail.assistant.domain.service.sales;

import com.retail.assistant.domain.entity.sales.Customer;
import java.util.List;
import java.util.Optional;

public interface CustomerService {
    Customer save(Customer entity);
    Customer getById(Long id);
    Optional<Customer> findById(Long id);
    List<Customer> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
