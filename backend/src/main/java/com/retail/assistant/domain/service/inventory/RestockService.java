package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.dto.tool.ToolDtos.RestockSuggestionsData;

public interface RestockService {

    RestockSuggestionsData getRestockSuggestions(Long storeId, Long productId, Integer planningDays, Integer lookbackDays);
}
