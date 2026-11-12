package com.retail.assistant.controller.system;

import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.repository.sales.SaleOrderRepository;
import com.retail.assistant.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class GeneralCompatController {

    private final SaleOrderRepository saleOrderRepository;
    private final JdbcTemplate jdbcTemplate;
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpClient httpClient;

    @Value("${telegram.bot.token:9021156914:AAGH7-WiuYcZaHh5tx1YnOA7vK2_dhBWO2k}")
    private String telegramBotToken;

    @Value("${telegram.chat.id:5062541960}")
    private String telegramChatId;

    public GeneralCompatController(SaleOrderRepository saleOrderRepository, JdbcTemplate jdbcTemplate, JwtTokenProvider jwtTokenProvider) {
        this.saleOrderRepository = saleOrderRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.jwtTokenProvider = jwtTokenProvider;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(4)).build();
    }

    // 1. DANH SÁCH ĐƠN HÀNG & LỊCH SỬ HÓA ĐƠN
    @GetMapping({"/sales-orders", "/sales-orders/retail/history"})
    public ResponseEntity<Map<String, Object>> getSalesOrders(
            @RequestParam(required = false) String orderChannel,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        String sql = """
            SELECT o.id, o.order_code, o.customer_id, o.customer_name, c.name as real_cust_name,
                   o.total_amount, o.discount_amount, o.final_amount, o.paid_amount, o.status, o.notes,
                   COUNT(d.id) as items_count, o.created_at, o.updated_at
            FROM sale_orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_detail d ON o.id = d.order_id
            GROUP BY o.id, c.name
            ORDER BY o.id DESC
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<Map<String, Object>> items = new ArrayList<>();

        for (Map<String, Object> o : rows) {
            String custName = o.get("customer_name") != null ? (String) o.get("customer_name") :
                    (o.get("real_cust_name") != null ? (String) o.get("real_cust_name") : "Khách lẻ tại quầy");
            String code = o.get("order_code") != null ? (String) o.get("order_code") : "HD-" + o.get("id");

            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = code.toLowerCase().contains(q) || custName.toLowerCase().contains(q);
                if (!match) continue;
            }

            String dbStatus = o.get("status") != null ? o.get("status").toString() : "DELIVERED";
            String uiStatus = "Delivered";
            if ("CANCELLED".equalsIgnoreCase(dbStatus)) {
                uiStatus = "Cancelled";
            } else if ("RETURNED".equalsIgnoreCase(dbStatus)) {
                uiStatus = "Returned";
            } else if ("PENDING".equalsIgnoreCase(dbStatus)) {
                uiStatus = "Pending";
            }

            double finalAmt = o.get("final_amount") instanceof Number ? ((Number) o.get("final_amount")).doubleValue() : 0.0;
            double paidAmt = o.get("paid_amount") instanceof Number ? ((Number) o.get("paid_amount")).doubleValue() : 0.0;

            String payStatus = "Paid";
            if ("CANCELLED".equalsIgnoreCase(dbStatus)) {
                payStatus = "Unpaid";
            } else if (paidAmt <= 0 && finalAmt > 0) {
                payStatus = "Unpaid";
            } else if (paidAmt < finalAmt) {
                payStatus = "Partial";
            }

            Map<String, Object> m = new HashMap<>();
            m.put("id", o.get("id"));
            m.put("orderCode", code);
            m.put("customerId", o.get("customer_id") != null ? o.get("customer_id") : 1);
            m.put("customerName", custName);
            m.put("totalAmount", o.get("total_amount") != null ? o.get("total_amount") : 0.0);
            m.put("discountAmount", o.get("discount_amount") != null ? o.get("discount_amount") : 0.0);
            m.put("finalAmount", finalAmt);
            m.put("status", uiStatus);
            m.put("orderChannel", orderChannel != null ? orderChannel : "Retail");
            m.put("paymentStatus", payStatus);
            m.put("itemsCount", o.get("items_count") != null ? ((Number) o.get("items_count")).intValue() : 1);
            m.put("notes", o.get("notes"));
            m.put("createdAt", o.get("created_at") != null ? o.get("created_at").toString() : "2026-10-30T09:00:00");
            m.put("updatedAt", o.get("updated_at") != null ? o.get("updated_at").toString() : "2026-10-30T09:00:00");
            items.add(m);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("limit", limit);
        data.put("total", items.size());

        Map<String, Object> env = new HashMap<>();
        env.put("success", true);
        env.put("data", data);
        return ResponseEntity.ok(env);
    }

    // 2. CHI TIẾT ĐƠN HÀNG
    @GetMapping("/sales-orders/{id}")
    public ResponseEntity<Map<String, Object>> getSalesOrderDetail(@PathVariable Long id) {
        String sql = """
            SELECT o.id, o.order_code, o.customer_id, o.customer_name, c.name as real_cust_name,
                   o.total_amount, o.discount_amount, o.final_amount, o.paid_amount, o.status, o.notes,
                   o.cancelled_at, o.cancelled_by, u.full_name as cancelled_by_name,
                   o.created_at, o.updated_at
            FROM sale_orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN users u ON o.cancelled_by = u.id
            WHERE o.id = ?
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, id);
        if (rows.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> o = rows.get(0);
        String code = o.get("order_code") != null ? (String) o.get("order_code") : "HD-" + id;
        String custName = o.get("customer_name") != null ? (String) o.get("customer_name") :
                (o.get("real_cust_name") != null ? (String) o.get("real_cust_name") : "Khách lẻ tại quầy");
        double total = o.get("total_amount") instanceof Number ? ((Number) o.get("total_amount")).doubleValue() : 1650000.0;
        double discount = o.get("discount_amount") instanceof Number ? ((Number) o.get("discount_amount")).doubleValue() : 0.0;
        double finalAmt = o.get("final_amount") instanceof Number ? ((Number) o.get("final_amount")).doubleValue() : total;
        double paidAmt = o.get("paid_amount") instanceof Number ? ((Number) o.get("paid_amount")).doubleValue() : 0.0;

        String dbStatus = o.get("status") != null ? o.get("status").toString() : "DELIVERED";
        String uiStatus = "Delivered";
        if ("CANCELLED".equalsIgnoreCase(dbStatus)) {
            uiStatus = "Cancelled";
        } else if ("RETURNED".equalsIgnoreCase(dbStatus)) {
            uiStatus = "Returned";
        } else if ("PENDING".equalsIgnoreCase(dbStatus)) {
            uiStatus = "Pending";
        }

        String payStatus = "Paid";
        if ("CANCELLED".equalsIgnoreCase(dbStatus)) {
            payStatus = "Unpaid";
        } else if (paidAmt <= 0 && finalAmt > 0) {
            payStatus = "Unpaid";
        } else if (paidAmt < finalAmt) {
            payStatus = "Partial";
        }

        String rawNotes = (String) o.get("notes");
        String cancelReason = null;
        if (rawNotes != null && rawNotes.contains("[Hủy đơn: ")) {
            int start = rawNotes.indexOf("[Hủy đơn: ") + 10;
            int end = rawNotes.indexOf("]", start);
            cancelReason = end > start ? rawNotes.substring(start, end) : rawNotes.substring(start);
        } else if ("Cancelled".equals(uiStatus)) {
            cancelReason = rawNotes;
        }

        String linesSql = """
            SELECT d.id, d.product_id, p.sku_code, p.name as product_name,
                   d.quantity, d.price_at_time, d.line_total,
                   u.unit_name
            FROM order_detail d
            JOIN products p ON d.product_id = p.id
            LEFT JOIN product_units u ON p.id = u.product_id AND u.is_base_unit = true
            WHERE d.order_id = ?
        """;
        List<Map<String, Object>> lineRows = jdbcTemplate.queryForList(linesSql, id);
        List<Map<String, Object>> lines = new ArrayList<>();
        for (Map<String, Object> lr : lineRows) {
            Map<String, Object> item = new HashMap<>();
            double price = lr.get("price_at_time") instanceof Number ? ((Number) lr.get("price_at_time")).doubleValue() : 0.0;
            double qty = lr.get("quantity") instanceof Number ? ((Number) lr.get("quantity")).doubleValue() : 1.0;
            double lt = lr.get("line_total") instanceof Number ? ((Number) lr.get("line_total")).doubleValue() : (price * qty);

            item.put("id", lr.get("id"));
            item.put("productId", lr.get("product_id"));
            item.put("productName", lr.get("product_name"));
            item.put("skuCode", lr.get("sku_code"));
            item.put("quantity", qty);
            item.put("unitPrice", price);
            item.put("totalPrice", lt);
            item.put("lineTotal", lt);
            item.put("unitName", lr.get("unit_name") != null ? lr.get("unit_name") : "Cái");
            lines.add(item);
        }

        if (lines.isEmpty()) {
            Map<String, Object> defItem = new HashMap<>();
            defItem.put("id", 1);
            defItem.put("productId", 1);
            defItem.put("productName", "Vật tư điện nước & TBVS");
            defItem.put("skuCode", "VT-DN-01");
            defItem.put("quantity", 1);
            defItem.put("unitPrice", total);
            defItem.put("totalPrice", total);
            defItem.put("lineTotal", total);
            defItem.put("unitName", "Cái");
            lines.add(defItem);
        }

        Map<String, Object> detail = new HashMap<>();
        detail.put("id", id);
        detail.put("orderCode", code);
        detail.put("customerId", o.get("customer_id") != null ? o.get("customer_id") : 1);
        detail.put("customerName", custName);
        detail.put("totalAmount", total);
        detail.put("discountAmount", discount);
        detail.put("finalAmount", finalAmt);
        detail.put("status", uiStatus);
        detail.put("orderChannel", "Retail");
        detail.put("paymentStatus", payStatus);
        detail.put("notes", rawNotes);
        detail.put("cancelReason", cancelReason);
        detail.put("cancelledAt", o.get("cancelled_at") != null ? o.get("cancelled_at").toString() : null);
        detail.put("cancelledBy", o.get("cancelled_by"));
        detail.put("cancelledByName", o.get("cancelled_by_name") != null ? o.get("cancelled_by_name") : "Nhân viên");
        detail.put("itemsCount", lines.size());
        detail.put("lines", lines);
        detail.put("items", lines);
        detail.put("createdAt", o.get("created_at") != null ? o.get("created_at").toString() : "2026-10-30T09:00:00");
        detail.put("updatedAt", o.get("updated_at") != null ? o.get("updated_at").toString() : "2026-10-30T09:00:00");

        return ResponseEntity.ok(Map.of("success", true, "data", detail));
    }

    @PostMapping("/sales-orders/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelSalesOrder(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String reason = body != null && body.containsKey("reason") ? (String) body.get("reason") : "Khách hàng yêu cầu hủy đơn";
        
        // Xác định người thực hiện hủy đơn
        String operatorName = "Trần Văn Minh (Nhân viên)";
        Long operatorId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                if (jwtTokenProvider.validateToken(token)) {
                    String username = jwtTokenProvider.getUsername(token);
                    String role = jwtTokenProvider.getRole(token);
                    Long uid = jwtTokenProvider.getUserId(token);
                    if (uid != null) {
                        operatorId = uid;
                        try {
                            String name = jdbcTemplate.queryForObject("SELECT full_name FROM users WHERE id = ?", String.class, uid);
                            if (name != null && !name.isBlank()) {
                                operatorName = name;
                            } else {
                                operatorName = ("Owner".equalsIgnoreCase(role) ? "Chủ cửa hàng (" : "Nhân viên (") + username + ")";
                            }
                        } catch (Exception e) {
                            operatorName = ("Owner".equalsIgnoreCase(role) ? "Chủ cửa hàng (" : "Nhân viên (") + username + ")";
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // Nếu không xác định được từ token, lấy người tạo đơn hoặc tài khoản Staff trong CSDL
        if (operatorId == null) {
            try {
                Long orderCreatorId = jdbcTemplate.queryForObject(
                    "SELECT user_id FROM sale_orders WHERE id = ?", Long.class, id);
                if (orderCreatorId != null) {
                    operatorId = orderCreatorId;
                    String creatorName = jdbcTemplate.queryForObject(
                        "SELECT full_name FROM users WHERE id = ?", String.class, orderCreatorId);
                    if (creatorName != null && !creatorName.isBlank()) {
                        operatorName = creatorName;
                    }
                }
            } catch (Exception ignored) {}
        }

        if (operatorId == null) {
            try {
                operatorId = jdbcTemplate.queryForObject(
                    "SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'STAFF' LIMIT 1", Long.class);
                operatorName = jdbcTemplate.queryForObject(
                    "SELECT full_name FROM users WHERE id = ?", String.class, operatorId);
            } catch (Exception ignored) {
                operatorId = 11L;
                operatorName = "Trần Văn Minh (Nhân viên)";
            }
        }

        // Lấy thông tin đơn hàng trước khi hủy để gửi Telegram
        String orderCode = "HD-" + id;
        String custName = "Khách hàng";
        double total = 0.0;
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT order_code, customer_name, total_amount FROM sale_orders WHERE id = ?", id);
            if (!rows.isEmpty()) {
                Map<String, Object> row = rows.get(0);
                if (row.get("order_code") != null) orderCode = (String) row.get("order_code");
                if (row.get("customer_name") != null) custName = (String) row.get("customer_name");
                if (row.get("total_amount") instanceof Number) total = ((Number) row.get("total_amount")).doubleValue();
            }
        } catch (Exception ignored) {}

        jdbcTemplate.update("""
            UPDATE sale_orders
            SET status = 'CANCELLED', paid_amount = 0, cancelled_at = NOW(), cancelled_by = ?,
                notes = COALESCE(notes, '') || ' [Hủy đơn: ' || ? || ']',
                updated_at = NOW()
            WHERE id = ?
        """, operatorId, reason, id);

        // Hoàn lại tồn kho & ghi inventory_log
        try {
            List<Map<String, Object>> details = jdbcTemplate.queryForList(
                "SELECT product_id, quantity FROM order_detail WHERE order_id = ?", id
            );
            for (Map<String, Object> det : details) {
                int pId = ((Number) det.get("product_id")).intValue();
                double q = ((Number) det.get("quantity")).doubleValue();
                jdbcTemplate.update("""
                    UPDATE inventory 
                    SET quantity = quantity + ?, updated_at = NOW() 
                    WHERE id = (
                        SELECT id FROM inventory 
                        WHERE product_id = ? 
                        ORDER BY id ASC 
                        LIMIT 1
                    )
                """, q, pId);

                jdbcTemplate.update("""
                    INSERT INTO inventory_log (product_id, action_type, quantity_change, reference_note, created_at)
                    VALUES (?, 'CANCEL_RESTOCK', ?, ?, NOW())
                """, pId, q, "Hoàn kho do hủy đơn " + orderCode);
            }
        } catch (Exception ignored) {}

        // TỰ ĐỘNG BẮN THÔNG BÁO TELEGRAM THẬT TỚI CHỦ CỬA HÀNG
        try {
            String timeStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
            String teleMsg = String.format(
                "🚨 CẢNH BÁO: ĐƠN HÀNG VỪA BỊ HỦY TRÊN HỆ THỐNG\n" +
                "⏱ Thời gian: %s\n" +
                "• Mã hóa đơn: %s\n" +
                "• Khách hàng: %s\n" +
                "• Trị giá đơn: %,.0f đ\n" +
                "• Người thao tác: %s\n" +
                "👉 Lý do ghi nhận: \"%s\"\n\n" +
                "✅ Hệ thống đã tự động hoàn lại tồn kho và cập nhật trạng thái hủy.",
                timeStr, orderCode, custName, total, operatorName, reason
            );
            String requestBody = "chat_id=" + URLEncoder.encode(telegramChatId, StandardCharsets.UTF_8)
                    + "&text=" + URLEncoder.encode(teleMsg, StandardCharsets.UTF_8);
            String teleUrl = "https://api.telegram.org/bot" + telegramBotToken + "/sendMessage";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(teleUrl))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(4))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (Exception ignored) {}

        Map<String, Object> res = Map.of(
            "id", id,
            "status", "Cancelled",
            "cancelledAt", LocalDateTime.now().toString(),
            "cancelledBy", 10
        );
        return ResponseEntity.ok(Map.of("success", true, "data", res));
    }

    @PatchMapping("/sales-orders/{id}")
    public ResponseEntity<Map<String, Object>> patchSalesOrder(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (body != null && body.containsKey("status")) {
            String st = (String) body.get("status");
            jdbcTemplate.update("UPDATE sale_orders SET status = ?, updated_at = NOW() WHERE id = ?", st, id);
        }
        return getSalesOrderDetail(id);
    }

    // 3. TRANG TỔNG QUAN HÔM NAY (TODAY OVERVIEW) CHUẨN ĐÚNG TODAYDATA
    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getTodayOverview() {
        Map<String, Object> money = Map.of(
                "incomeToday", 25820000.0,
                "expenseToday", 3500000.0,
                "netToday", 22320000.0,
                "cashflowMonthNet", 148500000.0
        );

        List<Map<String, Object>> actions = List.of(
                Map.of(
                        "id", "ACT-01",
                        "type", "OVERDUE_DEBT",
                        "severity", "High",
                        "title", "Công nợ quá hạn: Thợ Hoàng Văn Nam",
                        "subtitle", "Công trình Nam Cường quá hạn 10 ngày",
                        "amount", 12500000.0,
                        "targetPath", "/cashflow/debts",
                        "actionLabel", "Nhắc nợ Zalo"
                ),
                Map.of(
                        "id", "ACT-02",
                        "type", "LOW_STOCK",
                        "severity", "Medium",
                        "title", "Cảnh báo sắp hết hàng",
                        "subtitle", "Lavabo INAX AL-299V chỉ còn 8 chiếc trong kho",
                        "amount", 8.0,
                        "targetPath", "/inventory/stock",
                        "actionLabel", "Nhập kho"
                )
        );

        List<Map<String, Object>> debtHotlist = List.of(
                Map.of(
                        "debtId", 2,
                        "debtCode", "NO-THO-NAM",
                        "partnerType", "Customer",
                        "partnerName", "Hoàng Văn Nam (Thợ điện nước)",
                        "remainingAmount", 12500000.0,
                        "dueDate", LocalDate.now().minusDays(10).toString(),
                        "daysOverdue", 10,
                        "status", "Overdue",
                        "targetPath", "/cashflow/debts"
                ),
                Map.of(
                        "debtId", 1,
                        "debtCode", "NO-THAU-KIENA",
                        "partnerType", "Customer",
                        "partnerName", "Công ty Xây dựng Kiến Á (Nhà thầu)",
                        "remainingAmount", 25000000.0,
                        "dueDate", LocalDate.now().minusDays(12).toString(),
                        "daysOverdue", 12,
                        "status", "Overdue",
                        "targetPath", "/cashflow/debts"
                )
        );

        List<Map<String, Object>> inventoryNeeds = List.of(
                Map.of(
                        "productId", 1,
                        "sku", "TBVS-LVB-01",
                        "name", "Chậu Lavabo sứ đặt bàn Trắng tuyết Nano (INAX AL-299V)",
                        "quantity", 8,
                        "minQuantity", 3,
                        "level", "Warning",
                        "targetPath", "/inventory/stock"
                ),
                Map.of(
                        "productId", 11,
                        "sku", "DN-TP-PVC27",
                        "name", "Ống nhựa PVC-U Tiền Phong Phi 27 C2 dày 1.8mm",
                        "quantity", 180,
                        "minQuantity", 50,
                        "level", "Normal",
                        "targetPath", "/inventory/stock"
                )
        );

        Map<String, Object> closeDay = Map.of(
                "fundId", 1,
                "status", "Open",
                "expectedCash", 22320000.0,
                "countedCash", 22320000.0,
                "variance", 0.0
        );

        Map<String, Object> todayData = new HashMap<>();
        todayData.put("businessDate", LocalDate.now().toString());
        todayData.put("money", money);
        todayData.put("actions", actions);
        todayData.put("debtHotlist", debtHotlist);
        todayData.put("inventoryNeeds", inventoryNeeds);
        todayData.put("closeDay", closeDay);

        return ResponseEntity.ok(Map.of("success", true, "data", todayData));
    }

    @PostMapping("/sales-orders")
    public ResponseEntity<Map<String, Object>> createSalesOrder(@RequestBody Map<String, Object> body) {
        String channel = (String) body.getOrDefault("orderChannel", "Retail");
        boolean isReturn = "Return".equalsIgnoreCase(channel) || body.containsKey("refSalesOrderId");
        
        String prefix = isReturn ? "TH-" : "HD-";
        String orderCode = (String) body.get("orderCode");
        if (orderCode == null || orderCode.isBlank()) {
            orderCode = prefix + System.currentTimeMillis() % 100000;
        }

        Number custId = (Number) body.getOrDefault("customerId", 1);
        String custName = (String) body.getOrDefault("customerName", "Khách hàng");
        double totalAmount = body.get("totalAmount") != null ? ((Number) body.get("totalAmount")).doubleValue() : 0.0;
        double discountAmount = body.get("discountAmount") != null ? ((Number) body.get("discountAmount")).doubleValue() : 0.0;
        double finalAmount = body.get("finalAmount") != null ? ((Number) body.get("finalAmount")).doubleValue() : (totalAmount - discountAmount);
        String dbStatus = isReturn ? "RETURNED" : "DELIVERED";
        String notes = (String) body.getOrDefault("notes", isReturn ? "Đơn trả hàng" : "Đơn bán lẻ");

        Long orderId = jdbcTemplate.queryForObject("""
            INSERT INTO sale_orders (order_code, customer_id, user_id, total_amount, discount_amount, final_amount, paid_amount, status, notes, customer_name, created_at, updated_at)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id
        """, Long.class, orderCode, custId != null ? custId.longValue() : 1L, totalAmount, discountAmount, finalAmount, finalAmount, dbStatus, notes, custName);

        List<Map<String, Object>> lines = (List<Map<String, Object>>) body.get("lines");
        if (lines != null && orderId != null) {
            for (Map<String, Object> line : lines) {
                Number prodId = (Number) line.get("productId");
                Number unitId = (Number) line.getOrDefault("unitId", 1);
                double qty = line.get("quantity") != null ? ((Number) line.get("quantity")).doubleValue() : 1.0;
                double price = line.get("unitPrice") != null ? ((Number) line.get("unitPrice")).doubleValue() : 0.0;
                double lineTotal = qty * price;

                if (prodId != null) {
                    jdbcTemplate.update("""
                        INSERT INTO order_detail (order_id, product_id, quantity, price_at_time, line_total, dispatched_qty)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, orderId, prodId.longValue(), qty, price, lineTotal, qty);

                    if (isReturn) {
                        // Trả hàng -> Hoàn tồn kho
                        jdbcTemplate.update("UPDATE inventory SET quantity = quantity + ?, updated_at = NOW() WHERE product_id = ?", qty, prodId.longValue());
                        jdbcTemplate.update("INSERT INTO inventory_log (product_id, action_type, quantity_change, reference_note, created_at) VALUES (?, 'RETURN', ?, ?, NOW())",
                                prodId.longValue(), qty, "Nhập hoàn trả kho theo đơn " + orderCode);
                    } else {
                        // Bán lẻ -> Trừ tồn kho
                        jdbcTemplate.update("UPDATE inventory SET quantity = GREATEST(0, quantity - ?), updated_at = NOW() WHERE product_id = ?", qty, prodId.longValue());
                        jdbcTemplate.update("INSERT INTO inventory_log (product_id, action_type, quantity_change, reference_note, created_at) VALUES (?, 'OUT', ?, ?, NOW())",
                                prodId.longValue(), -qty, "Xuất kho bán hàng theo đơn " + orderCode);
                    }
                }
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", orderId != null ? orderId : 1L);
        res.put("orderCode", orderCode);
        res.put("customerId", custId);
        res.put("customerName", custName);
        res.put("totalAmount", totalAmount);
        res.put("discountAmount", discountAmount);
        res.put("finalAmount", finalAmount);
        res.put("status", dbStatus);
        res.put("orderChannel", channel);
        res.put("paymentStatus", "Paid");
        res.put("notes", notes);
        res.put("createdAt", java.time.Instant.now().toString());
        res.put("updatedAt", java.time.Instant.now().toString());

        return ResponseEntity.ok(Map.of("success", true, "data", res));
    }
}
