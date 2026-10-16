package com.retail.assistant.domain.repository.supplier;

import com.retail.assistant.domain.entity.supplier.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}
