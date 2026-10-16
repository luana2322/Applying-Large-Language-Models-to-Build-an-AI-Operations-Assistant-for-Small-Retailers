package com.retail.assistant.domain.service.finance;

import com.retail.assistant.domain.entity.finance.FinanceLedger;
import java.util.List;
import java.util.Optional;

public interface FinanceLedgerService {
    FinanceLedger save(FinanceLedger entity);
    FinanceLedger getById(Long id);
    Optional<FinanceLedger> findById(Long id);
    List<FinanceLedger> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<FinanceLedger> findByCreatedById(Long id);
}
