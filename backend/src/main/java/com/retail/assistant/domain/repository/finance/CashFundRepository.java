package com.retail.assistant.domain.repository.finance;

import com.retail.assistant.domain.entity.finance.CashFund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CashFundRepository extends JpaRepository<CashFund, Long> {
}
