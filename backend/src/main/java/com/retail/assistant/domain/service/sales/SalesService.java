package com.retail.assistant.domain.service.sales;

import com.retail.assistant.dto.tool.ToolDtos.SalesSummaryData;
import com.retail.assistant.dto.tool.ToolDtos.TopProductsData;

public interface SalesService {

    SalesSummaryData getSalesSummary(Long storeId, String startDateStr, String endDateStr, String groupBy);

    TopProductsData getTopProducts(Long storeId, String startDateStr, String endDateStr, String metric, Integer limit);
}
