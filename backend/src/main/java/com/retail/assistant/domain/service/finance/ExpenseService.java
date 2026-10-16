package com.retail.assistant.domain.service.finance;

import com.retail.assistant.dto.tool.ToolDtos.ExpenseSummaryData;

public interface ExpenseService {

    ExpenseSummaryData getExpenseSummary(Long storeId, String startDateStr, String endDateStr, String categoryFilter);
}
