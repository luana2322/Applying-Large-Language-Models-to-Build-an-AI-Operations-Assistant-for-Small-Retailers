package com.retail.assistant.domain.service.sales;

import com.retail.assistant.dto.tool.ToolDtos.ProfitSummaryData;

public interface ProfitService {

    ProfitSummaryData getProfitSummary(Long storeId, String startDateStr, String endDateStr);
}
