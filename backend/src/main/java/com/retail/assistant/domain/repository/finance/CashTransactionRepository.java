package com.retail.assistant.domain.repository.finance;

import com.retail.assistant.domain.entity.finance.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    List<CashTransaction> findByFundId(Long id);
    List<CashTransaction> findByFinanceLedgerId(Long id);
    List<CashTransaction> findByCreatedById(Long id);
}
