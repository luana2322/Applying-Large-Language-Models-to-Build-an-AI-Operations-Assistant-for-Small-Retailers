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
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public InternalBusinessApiController(
        StoreRepository storeRepository,
        SalesService salesService,
        ProfitService profitService,
        InventoryService inventoryService,
        ExpenseService expenseService,
        RestockService restockService,
        org.springframework.jdbc.core.JdbcTemplate jdbcTemplate
    ) {
        this.storeRepository = storeRepository;
        this.salesService = salesService;
        this.profitService = profitService;
        this.inventoryService = inventoryService;
        this.expenseService = expenseService;
        this.restockService = restockService;
        this.jdbcTemplate = jdbcTemplate;
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
        Integer lookback = (req != null && req.lookback_days() != null) ? req.lookback_days() : 30;
        Integer minStock = (req != null && req.min_stock_quantity() != null) ? req.min_stock_quantity() : 5;
        Integer maxSales = (req != null && req.max_sales_quantity() != null) ? req.max_sales_quantity() : 2;

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

    @PostMapping("/search-products")
    public ResponseEntity<ToolResponse<SearchProductsData>> searchProducts(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) SearchProductsRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String query = req != null && req.query() != null ? req.query().trim() : "";
        int limit = (req != null && req.limit() != null) ? req.limit() : 10;

        // Tách các từ khóa chính, loại bỏ các từ đệm thông thường
        String cleanQuery = query.toLowerCase().replaceAll("[^a-z0-9à-ỹ\\.\\s]", " ");
        String[] words = cleanQuery.trim().split("\\s+");
        java.util.List<String> keyTokens = new java.util.ArrayList<>();
        java.util.Set<String> stopWords = java.util.Set.of("con", "còn", "bao", "nhiêu", "may", "mấy", "cuon", "cuộn", "cay", "cây", "cho", "hoi", "hỏi", "san", "sản", "pham", "phẩm");
        for (String w : words) {
            if (w.length() >= 2 && !stopWords.contains(w)) {
                keyTokens.add("%" + w + "%");
            }
        }
        if (keyTokens.isEmpty()) {
            keyTokens.add("%" + query.toLowerCase() + "%");
        }

        StringBuilder whereClause = new StringBuilder(" WHERE p.deleted_at IS NULL ");
        java.util.List<Object> params = new java.util.ArrayList<>();
        for (String tokenPattern : keyTokens) {
            whereClause.append(" AND (LOWER(p.name) LIKE ? OR LOWER(p.sku_code) LIKE ? OR LOWER(COALESCE(p.description, '')) LIKE ?)");
            params.add(tokenPattern);
            params.add(tokenPattern);
            params.add(tokenPattern);
        }

        String pSql = """
            SELECT p.id, p.name, p.sku_code, COALESCE(p.selling_price, 0) as selling_price, c.name as category_name,
                   COALESCE(u.unit_name, p.unit, 'Cái') as base_unit,
                   COALESCE(SUM(i.quantity), 0) as current_stock,
                   ps.dimensions, ps.material, ps.color
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_units u ON p.id = u.product_id AND u.is_base_unit = true
            LEFT JOIN inventory i ON p.id = i.product_id
            LEFT JOIN product_specifications ps ON p.id = ps.product_id
        """ + whereClause.toString() + """
            GROUP BY p.id, p.name, p.sku_code, p.selling_price, p.unit, c.name, u.unit_name, ps.dimensions, ps.material, ps.color
            ORDER BY current_stock DESC
            LIMIT ?
        """;
        params.add(limit);

        java.util.List<java.util.Map<String, Object>> rows = jdbcTemplate.queryForList(pSql, params.toArray());
        java.util.List<ProductSearchItem> items = new java.util.ArrayList<>();

        for (java.util.Map<String, Object> r : rows) {
            Long pId = ((Number) r.get("id")).longValue();
            String name = (String) r.get("name");
            String sku = (String) r.get("sku_code");
            String cat = (String) r.get("category_name");
            String baseUnit = r.get("base_unit") != null ? (String) r.get("base_unit") : "Cái";
            Double price = r.get("selling_price") instanceof Number ? ((Number) r.get("selling_price")).doubleValue() : 0.0;
            Double currentStock = r.get("current_stock") instanceof Number ? ((Number) r.get("current_stock")).doubleValue() : 0.0;

            // Lấy quy đổi đơn vị (cuộn -> mét, cây -> mét)
            java.util.List<UnitConversionInfo> conversions = new java.util.ArrayList<>();
            try {
                String cSql = "SELECT packaging_unit, base_unit, conversion_rate FROM product_unit_conversions WHERE product_id = ?";
                var cRows = jdbcTemplate.queryForList(cSql, pId);
                for (var cr : cRows) {
                    String pack = (String) cr.get("packaging_unit");
                    String bUnit = (String) cr.get("base_unit");
                    Double rate = cr.get("conversion_rate") instanceof Number ? ((Number) cr.get("conversion_rate")).doubleValue() : 1.0;
                    Double stockInPack = rate > 0 ? (Math.round((currentStock / rate) * 100.0) / 100.0) : currentStock;
                    conversions.add(new UnitConversionInfo(pack, bUnit, rate, stockInPack));
                }
            } catch (Exception ignored) {}

            String spec = "";
            if (r.get("dimensions") != null) spec += "Kích thước: " + r.get("dimensions") + "; ";
            if (r.get("material") != null) spec += "Chất liệu: " + r.get("material") + "; ";
            if (r.get("color") != null) spec += "Màu sắc: " + r.get("color");

            items.add(new ProductSearchItem(pId, sku, name, cat, baseUnit, price, currentStock, conversions, spec.trim()));
        }

        var data = new SearchProductsData(query, items.size(), items);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/contractor-debts")
    public ResponseEntity<ToolResponse<ContractorDebtsData>> getContractorDebts(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) ContractorDebtsRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String status = req != null && req.status() != null ? req.status().toUpperCase() : "ALL";
        int limit = (req != null && req.limit() != null) ? req.limit() : 10;

        String sql = """
            SELECT d.id as debt_id, d.customer_id, c.name as customer_name, c.phone,
                   p.project_name, d.total_amount, d.paid_amount, d.remaining_amount,
                   d.due_date, d.overdue_days, d.status, d.risk_level, d.notes
            FROM partner_debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN customer_projects p ON d.project_id = p.id
            WHERE (? = 'ALL' OR UPPER(d.status) = ?)
            ORDER BY d.remaining_amount DESC
            LIMIT ?
        """;

        var rows = jdbcTemplate.queryForList(sql, status, status, limit);
        java.util.List<ContractorDebtItem> debts = new java.util.ArrayList<>();
        double totalRemaining = 0.0;

        for (var r : rows) {
            Long dId = ((Number) r.get("debt_id")).longValue();
            Long cId = r.get("customer_id") instanceof Number ? ((Number) r.get("customer_id")).longValue() : 0L;
            String cName = r.get("customer_name") != null ? (String) r.get("customer_name") : "Khách công trình";
            String phone = (String) r.get("phone");
            String projName = (String) r.get("project_name");
            Double totalAmt = r.get("total_amount") instanceof Number ? ((Number) r.get("total_amount")).doubleValue() : 0.0;
            Double paidAmt = r.get("paid_amount") instanceof Number ? ((Number) r.get("paid_amount")).doubleValue() : 0.0;
            Double remAmt = r.get("remaining_amount") instanceof Number ? ((Number) r.get("remaining_amount")).doubleValue() : 0.0;
            String dueDate = r.get("due_date") != null ? r.get("due_date").toString() : "";
            Integer overdue = r.get("overdue_days") instanceof Number ? ((Number) r.get("overdue_days")).intValue() : 0;
            String st = (String) r.get("status");
            String risk = (String) r.get("risk_level");
            String notes = (String) r.get("notes");

            totalRemaining += remAmt;
            debts.add(new ContractorDebtItem(dId, cId, cName, phone, projName, totalAmt, paidAmt, remAmt, dueDate, overdue, st, risk, notes));
        }

        var data = new ContractorDebtsData(debts.size(), totalRemaining, debts);
        return ResponseEntity.ok(ToolResponse.ok(storeId, data, true));
    }

    @PostMapping("/sanitary-combo")
    public ResponseEntity<ToolResponse<SanitaryComboData>> getSanitaryCombo(
        @RequestHeader(value = "X-Internal-Token", required = false) String token,
        @RequestHeader(value = "X-Store-Id", required = false) String storeIdHeader,
        @RequestBody(required = false) SanitaryComboRequest req
    ) {
        Long storeId = validateAuthAndStore(token, storeIdHeader);
        String color = req != null && req.color() != null ? req.color() : "Trắng tuyết";
        String install = req != null && req.installation_type() != null ? req.installation_type() : "Đặt bàn";

        java.util.List<TileAdvice> tiles = java.util.List.of(
            new TileAdvice("Hiện đại & Sang trọng (Luxury Modern)", "Gạch Calacatta White 30x60 mờ (Vân mây xám)", "GM-CALA-60", 220000.0, "m2", "Vân đá marble xám khói trên nền trắng tạo chiều sâu tinh tế, tôn vinh độ bóng mịn của men sứ Aqua Ceramic."),
            new TileAdvice("Tối giản Bắc Âu / Wabi-sabi (Minimalist)", "Gạch Terrazzo xám hạt mịn 60x60 chống trơn", "GM-TERRA-01", 260000.0, "m2", "Màu xám xi măng hạt muối tiêu tương phản nhẹ nhàng với chậu trắng, mang lại cảm giác mộc mạc và sạch sẽ."),
            new TileAdvice("Điểm nhấn nghệ thuật (Accent Wall)", "Gạch thẻ Xanh Ngọc Lục Bảo 7.5x15", "GM-SUB-XANH", 340000.0, "m2", "Ốp điểm mảng tường sau gương tạo hiệu ứng thị giác nổi bật, làm chiếc lavabo trắng trở thành tâm điểm của phòng tắm.")
        );

        java.util.List<AccessoryFitting> accessories = java.util.List.of(
            new AccessoryFitting("Vòi chậu nóng lạnh", "Vòi Lavabo nóng lạnh thân cao 30cm Đen mờ tĩnh điện", "TBVS-VOI-01", 720000.0, true, "Lavabo đặt bàn bắt buộc dùng vòi cổ cao. Tone đen nhám tạo nét tương phản hiện đại chuẩn xu hướng."),
            new AccessoryFitting("Bộ xả xi-phông", "Bộ xả xi-phông thoát nước nhấn nắp sứ Trắng đồng bộ", "TBVS-XP-01", 190000.0, true, "Nắp xả sứ trắng hòa vào màu lòng chậu đồng bộ, đuôi chữ P bằng đồng chống tràn và ngăn hôi cống."),
            new AccessoryFitting("Van góc & Dây cấp", "Cặp van góc Inox 304 kèm dây cấp chịu nhiệt 60cm", "TBVS-VG-01", 150000.0, true, "Phụ kiện đấu nối nước lạnh/nóng âm tường, bảo vệ vòi chậu và chống bục vỡ áp lực cao."),
            new AccessoryFitting("Vật tư phụ chống ẩm", "Keo Silicone trung tính Apolo A500 Trắng sữa (Chống mốc)", "DN-KEO-APOLO", 60000.0, true, "Trám viền quanh đáy lavabo tiếp xúc mặt đá chống đọng nước và ố mốc chân chậu.")
        );

        double lavaboPrice = 1650000.0;
        double accessoryTotal = accessories.stream().mapToDouble(AccessoryFitting::price).sum();
        double originalTotal = lavaboPrice + accessoryTotal;
        double discountComboTotal = Math.round(originalTotal * 0.95);
        double savings = originalTotal - discountComboTotal;

        var data = new SanitaryComboData(color, install, lavaboPrice, tiles, accessories, originalTotal, discountComboTotal, savings, "5%");
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
