package com.retail.assistant.domain.service.finance;

import com.retail.assistant.domain.entity.finance.CashTransaction;
import java.util.List;
import java.util.Optional;

public interface CashTransactionService {
    CashTransaction save(CashTransaction entity);
    CashTransaction getById(Long id);
    Optional<CashTransaction> findById(Long id);
    List<CashTransaction> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<CashTransaction> findByFundId(Long id);
    List<CashTransaction> findByFinanceLedgerId(Long id);
    List<CashTransaction> findByCreatedById(Long id);
}
