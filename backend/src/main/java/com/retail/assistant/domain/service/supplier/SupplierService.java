package com.retail.assistant.domain.service.supplier;

import com.retail.assistant.domain.entity.supplier.Supplier;
import java.util.List;
import java.util.Optional;

public interface SupplierService {
    Supplier save(Supplier entity);
    Supplier getById(Long id);
    Optional<Supplier> findById(Long id);
    List<Supplier> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
