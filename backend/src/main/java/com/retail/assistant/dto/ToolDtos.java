package com.retail.assistant.dto;

import java.util.List;

public class ToolDtos {

    // 1. Sales Summary
    public record SalesSummaryRequest(String start_date, String end_date, String group_by) {}
    public record SalesSummaryData(
        String start_date,
        String end_date,
        Double gross_revenue,
        Double total_discount,
        Double total_returns,
        Double net_revenue,
        Long valid_order_count,
        String currency
    ) {}

    // 2. Profit Summary
    public record ProfitSummaryRequest(String start_date, String end_date) {}
    public record ProfitSummaryData(
        String start_date,
        String end_date,
        Double net_revenue,
        Double cost_of_goods_sold,
        Double gross_profit,
        Double gross_margin_percentage,
        boolean has_missing_cost,
        String currency,
        String note
    ) {}

    // 3. Top Products
    public record TopProductsRequest(String start_date, String end_date, String metric, Integer limit) {}
    public record ProductRankItem(
        Integer rank,
        Long product_id,
        String sku,
        String name,
        Long quantity_sold,
        Double net_revenue
    ) {}
    public record TopProductsData(
        String start_date,
        String end_date,
        String metric,
        List<ProductRankItem> products
    ) {}

    // 4. Inventory Status
    public record InventoryStatusRequest(Long product_id, String category, String status) {}
    public record InventoryItemData(
        Long product_id,
        String sku,
        String name,
        String category,
        String unit,
        Integer current_stock,
        Integer min_stock_level,
        String stock_status // "OUT_OF_STOCK", "LOW_STOCK", "NORMAL"
    ) {}
    public record InventoryStatusData(
        int total_items,
        int low_stock_count,
        int out_of_stock_count,
        List<InventoryItemData> items
    ) {}

    // 5. Slow Moving Products
    public record SlowMovingRequest(Integer lookback_days, Integer min_stock_quantity, Integer max_sales_quantity) {}
    public record SlowMovingItem(
        Long product_id,
        String sku,
        String name,
        Integer current_stock,
        Long quantity_sold,
        String last_sold_date,
        String reason
    ) {}
    public record SlowMovingData(
        int lookback_days,
        List<SlowMovingItem> slow_moving_products
    ) {}

    // 6. Expense Summary
    public record ExpenseSummaryRequest(String start_date, String end_date, String category) {}
    public record ExpenseCategoryItem(String category, Double total_amount, Long transaction_count) {}
    public record ExpenseSummaryData(
        String start_date,
        String end_date,
        Double total_expense,
        List<ExpenseCategoryItem> by_category,
        String currency
    ) {}

    // 7. Restock Suggestions
    public record RestockSuggestionsRequest(Long product_id, Integer planning_days, Integer lookback_days) {}
    public record RestockItemSuggestion(
        Long product_id,
        String sku,
        String name,
        Integer current_stock,
        Double daily_sales_velocity,
        Integer target_stock,
        Integer suggested_quantity,
        String reason
    ) {}
    public record RestockSuggestionsData(
        int planning_days,
        int lookback_days,
        List<RestockItemSuggestion> suggestions
    ) {}
}
