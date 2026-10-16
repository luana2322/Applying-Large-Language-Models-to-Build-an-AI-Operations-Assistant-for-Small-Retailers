package com.retail.assistant.controller.internal;

import com.retail.assistant.domain.entity.system.Store;
import com.retail.assistant.domain.repository.system.StoreRepository;
import com.retail.assistant.domain.service.sales.*;
import com.retail.assistant.domain.service.inventory.*;
import com.retail.assistant.domain.service.finance.*;
import com.retail.assistant.domain.service.ai.*;
import com.retail.assistant.dto.tool.ToolDtos.*;
import com.retail.assistant.dto.tool.ToolResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/api/v1/business")
public class InternalBusinessApiController {

    @Value("${app.internal-auth-token:retail-internal-secret-token-v1}")
    private String configuredInternalToken;

    private final StoreRepository storeRepository;
    private final SalesService salesService;
    private final ProfitService profitService;
    private final InventoryService inventoryService;
    private final ExpenseService expenseService;
    private final RestockService restockService;

    public InternalBusinessApiController(
        StoreRepository storeRepository,
        SalesService salesService,
        ProfitService profitService,
        InventoryService inventoryService,
        ExpenseService expenseService,
        RestockService restockService
    ) {
        this.storeRepository = storeRepository;
        this.salesService = salesService;
        this.profitService = profitService;
        this.inventoryService = inventoryService;
        this.expenseService = expenseService;
        this.restockService = restockService;
    }

    private Long validateAuthAndStore(String token, String storeIdHeader) {
        if (token == null || !token.equals(configuredInternalToken)) {
            throw new SecurityException("UNAUTHORIZED_INTERNAL_CALL: Invalid internal service token");
        }
        if (storeIdHeader == null || storeIdHeader.isBlank()) {
            throw new IllegalArgumentException("MISSING_STORE_ID: X-Store-Id header is required");
        }
        try {
            Long storeId = Long.parseLong(storeIdHeader.trim());
            if (!storeRepository.existsById(storeId)) {
                throw new IllegalArgumentException("STORE_NOT_FOUND: Store ID does not exist");
            }
            return storeId;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("INVALID_STORE_ID: Must be a valid integer");
        }
    }

    @PostMapping("/sales-summary")
    public ResponseEntity<ToolResponse<SalesSummaryData>> getSalesSummary(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) SalesSummaryRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String start = req != null ? req.start_date() : null;
        String end = req != null ? req.end_date() : null;
        String groupBy = req != null ? req.group_by() : null;

        var data = salesService.getSalesSummary(storeId, start, end, groupBy);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/profit-summary")
    public ResponseEntity<ToolResponse<ProfitSummaryData>> getProfitSummary(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) ProfitSummaryRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String start = req != null ? req.start_date() : null;
        String end = req != null ? req.end_date() : null;

        var data = profitService.getProfitSummary(storeId, start, end);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/top-products")
    public ResponseEntity<ToolResponse<TopProductsData>> getTopProducts(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) TopProductsRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String start = req != null ? req.start_date() : null;
        String end = req != null ? req.end_date() : null;
        String metric = req != null ? req.metric() : "quantity";
        Integer limit = req != null ? req.limit() : 5;

        var data = salesService.getTopProducts(storeId, start, end, metric, limit);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/inventory-status")
    public ResponseEntity<ToolResponse<InventoryStatusData>> getInventoryStatus(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) InventoryStatusRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        Long productId = req != null ? req.product_id() : null;
        String category = req != null ? req.category() : null;
        String status = req != null ? req.status() : "all";

        var data = inventoryService.getInventoryStatus(storeId, productId, category, status);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/slow-moving-products")
    public ResponseEntity<ToolResponse<SlowMovingData>> getSlowMovingProducts(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) SlowMovingRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        Integer lookback = req != null ? req.lookback_days() : 30;
        Integer minStock = req != null ? req.min_stock_quantity() : 5;
        Integer maxSales = req != null ? req.max_sales_quantity() : 2;

        var data = inventoryService.getSlowMovingProducts(storeId, lookback, minStock, maxSales);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/expense-summary")
    public ResponseEntity<ToolResponse<ExpenseSummaryData>> getExpenseSummary(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) ExpenseSummaryRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String start = req != null ? req.start_date() : null;
        String end = req != null ? req.end_date() : null;
        String category = req != null ? req.category() : null;

        var data = expenseService.getExpenseSummary(storeId, start, end, category);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/restock-suggestions")
    public ResponseEntity<ToolResponse<RestockSuggestionsData>> getRestockSuggestions(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) RestockSuggestionsRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        Long productId = req != null ? req.product_id() : null;
        Integer planningDays = req != null ? req.planning_days() : 14;
        Integer lookbackDays = req != null ? req.lookback_days() : 30;

        var data = restockService.getRestockSuggestions(storeId, productId, planningDays, lookbackDays);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ToolResponse<Void>> handleSecurity(SecurityException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ToolResponse.fail("UNAUTHORIZED", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ToolResponse<Void>> handleBadReq(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ToolResponse.fail("BAD_REQUEST", e.getMessage()));
    }
}
