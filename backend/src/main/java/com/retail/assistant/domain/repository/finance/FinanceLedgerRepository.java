package com.retail.assistant.domain.repository.finance;

import com.retail.assistant.domain.entity.finance.FinanceLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FinanceLedgerRepository extends JpaRepository<FinanceLedger, Long> {
    List<FinanceLedger> findByCreatedById(Long id);
}
