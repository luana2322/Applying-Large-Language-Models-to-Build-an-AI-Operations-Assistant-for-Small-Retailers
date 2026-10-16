package com.retail.assistant.domain.service.finance;

import com.retail.assistant.domain.entity.finance.CashFund;
import java.util.List;
import java.util.Optional;

public interface CashFundService {
    CashFund save(CashFund entity);
    CashFund getById(Long id);
    Optional<CashFund> findById(Long id);
    List<CashFund> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
