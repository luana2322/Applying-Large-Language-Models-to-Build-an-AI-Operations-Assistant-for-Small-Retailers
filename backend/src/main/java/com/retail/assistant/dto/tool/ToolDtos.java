package com.retail.assistant.dto.tool;

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

    // 8. Search Products (Tra cứu sản phẩm, quy cách, đơn vị tính quy đổi ngành điện nước)
    public record SearchProductsRequest(String query, String category, Integer limit) {}
    public record UnitConversionInfo(String packaging_unit, String base_unit, Double conversion_rate, Double stock_in_packaging_unit) {}
    public record ProductSearchItem(
        Long product_id,
        String sku,
        String name,
        String category,
        String base_unit,
        Double retail_price,
        Double current_stock,
        List<UnitConversionInfo> unit_conversions,
        String specifications
    ) {}
    public record SearchProductsData(
        String query,
        int total_matches,
        List<ProductSearchItem> products
    ) {}

    // 9. Contractor Debts (Sổ nợ thợ công trình & tuổi nợ)
    public record ContractorDebtsRequest(String status, Long customer_id, Integer limit) {}
    public record ContractorDebtItem(
        Long debt_id,
        Long customer_id,
        String customer_name,
        String phone,
        String project_name,
        Double total_amount,
        Double paid_amount,
        Double remaining_amount,
        String due_date,
        Integer overdue_days,
        String status,
        String risk_level,
        String notes
    ) {}
    public record ContractorDebtsData(
        int total_debts,
        Double total_remaining_amount,
        List<ContractorDebtItem> debts
    ) {}

    // 10. Sanitary Combo (Gợi ý combo thiết bị vệ sinh, vòi chậu & gạch ốp)
    public record SanitaryComboRequest(String color, String installation_type) {}
    public record TileAdvice(String style, String tile_name, String sku, Double price, String unit, String reason) {}
    public record AccessoryFitting(String role, String name, String sku, Double price, boolean required, String reason) {}
    public record SanitaryComboData(
        String color,
        String installation_type,
        Double lavabo_price,
        List<TileAdvice> tile_recommendations,
        List<AccessoryFitting> combo_accessories,
        Double original_total,
        Double discount_combo_total,
        Double savings,
        String discount_pct
    ) {}
}
