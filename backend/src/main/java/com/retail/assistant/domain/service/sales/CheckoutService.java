package com.retail.assistant.domain.service.sales;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CheckoutService {

    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);

    private final JdbcTemplate jdbcTemplate;

    public CheckoutService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> processRetailCheckout(Map<String, Object> body, Long currentUserId) {
        if (body == null) {
            throw new IllegalArgumentException("Dữ liệu thanh toán không được để trống");
        }

        List<?> rawLines = body.get("lines") instanceof List ? (List<?>) body.get("lines") : Collections.emptyList();
        if (rawLines.isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải chứa ít nhất một sản phẩm");
        }

        // 1. Thông tin khách hàng
        Integer customerId = null;
        String customerName = "Khách mua lẻ tại quầy";
        if (body.get("customerId") instanceof Number) {
            customerId = ((Number) body.get("customerId")).intValue();
            try {
                String cSql = "SELECT name FROM customers WHERE id = ?";
                List<String> names = jdbcTemplate.queryForList(cSql, String.class, customerId);
                if (!names.isEmpty() && names.get(0) != null) {
                    customerName = names.get(0);
                }
            } catch (Exception ignored) {}
        }

        String notes = body.containsKey("notes") && body.get("notes") != null
                ? body.get("notes").toString() : "Bán lẻ tại quầy POS";
        String paymentStatus = body.containsKey("paymentStatus") && body.get("paymentStatus") != null
                ? body.get("paymentStatus").toString() : "Paid";
        double discount = body.get("discountAmount") instanceof Number
                ? ((Number) body.get("discountAmount")).doubleValue() : 0.0;

        // Sinh mã đơn hàng an toàn
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomSuffix = String.format("%04d", (System.currentTimeMillis() % 10000));
        String orderCode = "HD-" + datePrefix + "-" + randomSuffix;

        double totalAmount = 0.0;
        List<Map<String, Object>> processedLines = new ArrayList<>();

        // 2. Duyệt từng dòng sản phẩm, kiểm tra tồn kho & trừ kho nguyên tử
        for (Object item : rawLines) {
            if (!(item instanceof Map)) continue;
            Map<?, ?> lineMap = (Map<?, ?>) item;

            if (!(lineMap.get("productId") instanceof Number)) {
                throw new IllegalArgumentException("Dòng đơn hàng thiếu productId hợp lệ");
            }
            int productId = ((Number) lineMap.get("productId")).intValue();
            double quantity = lineMap.get("quantity") instanceof Number
                    ? ((Number) lineMap.get("quantity")).doubleValue() : 1.0;

            if (quantity <= 0) {
                throw new IllegalArgumentException("Số lượng sản phẩm ID " + productId + " phải lớn hơn 0");
            }

            // Lấy thông tin sản phẩm chuẩn từ DB
            String pSql = """
                SELECT p.id, p.name, p.sku_code, COALESCE(p.selling_price, 0) as selling_price, p.status,
                       u.id as unit_id, COALESCE(u.unit_name, p.unit, 'Cái') as unit_name
                FROM products p
                LEFT JOIN product_units u ON p.id = u.product_id AND u.is_base_unit = true
                WHERE p.id = ? AND p.deleted_at IS NULL
            """;
            List<Map<String, Object>> pRows = jdbcTemplate.queryForList(pSql, productId);
            if (pRows.isEmpty()) {
                throw new IllegalStateException("Sản phẩm ID " + productId + " không tồn tại hoặc đã ngừng kinh doanh");
            }

            Map<String, Object> pRow = pRows.get(0);
            String pName = (String) pRow.get("name");
            String sku = (String) pRow.get("sku_code");
            Integer unitId = pRow.get("unit_id") instanceof Number ? ((Number) pRow.get("unit_id")).intValue() : null;
            String unitName = pRow.get("unit_name") != null ? (String) pRow.get("unit_name") : "Cái";

            double basePrice = pRow.get("selling_price") instanceof Number
                    ? ((Number) pRow.get("selling_price")).doubleValue() : 0.0;
            double unitPrice = lineMap.get("unitPrice") instanceof Number
                    ? ((Number) lineMap.get("unitPrice")).doubleValue() : basePrice;

            double lineTotal = unitPrice * quantity;
            totalAmount += lineTotal;

            // Kiểm tra quy đổi đơn vị (ví dụ cuộn -> mét, cây -> mét)
            double conversionRate = 1.0;
            String reqUnit = lineMap.get("unitName") != null ? lineMap.get("unitName").toString().trim() : "";
            if (!reqUnit.isEmpty() && !reqUnit.equalsIgnoreCase(unitName)) {
                try {
                    List<BigDecimal> rates = jdbcTemplate.queryForList("""
                        SELECT conversion_rate FROM product_unit_conversions
                        WHERE product_id = ? AND LOWER(packaging_unit) = LOWER(?)
                        LIMIT 1
                    """, BigDecimal.class, productId, reqUnit);
                    if (!rates.isEmpty() && rates.get(0) != null) {
                        conversionRate = rates.get(0).doubleValue();
                    }
                } catch (Exception ignored) {}
            }
            double baseDeductQty = quantity * conversionRate;

            // Khóa dòng và kiểm tra tồn kho tổng
            Double totalStock = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(quantity), 0) FROM inventory WHERE product_id = ?",
                Double.class, productId
            );
            if (totalStock == null || totalStock < baseDeductQty) {
                throw new IllegalStateException("Sản phẩm '" + pName + "' (SKU: " + sku + ") không đủ tồn kho! "
                        + "Hiện có: " + (totalStock != null ? totalStock : 0) + ", cần xuất: " + baseDeductQty);
            }

            // Trừ kho FIFO an toàn (FOR UPDATE để tránh race condition bán âm kho)
            List<Map<String, Object>> invRows = jdbcTemplate.queryForList("""
                SELECT id, quantity FROM inventory
                WHERE product_id = ? AND quantity > 0
                ORDER BY id ASC
                FOR UPDATE
            """, productId);

            double remainingToDeduct = baseDeductQty;
            for (Map<String, Object> inv : invRows) {
                if (remainingToDeduct <= 0) break;
                long invId = ((Number) inv.get("id")).longValue();
                double availableInBatch = ((Number) inv.get("quantity")).doubleValue();
                double deduct = Math.min(availableInBatch, remainingToDeduct);

                int affected = jdbcTemplate.update(
                    "UPDATE inventory SET quantity = quantity - ?, updated_at = NOW() WHERE id = ? AND quantity >= ?",
                    deduct, invId, deduct
                );
                if (affected == 0) {
                    throw new IllegalStateException("Xung đột đồng thời khi cập nhật tồn kho cho sản phẩm " + pName);
                }
                remainingToDeduct -= deduct;
            }

            if (remainingToDeduct > 0.0001) {
                throw new IllegalStateException("Không thể trừ đủ tồn kho cho sản phẩm " + pName);
            }

            // Ghi nhật ký xuất kho vào inventory_log
            try {
                jdbcTemplate.update("""
                    INSERT INTO inventory_log (product_id, action_type, quantity_change, unit_id, user_id, reference_note, created_at)
                    VALUES (?, 'OUT', ?, ?, ?, ?, NOW())
                """, productId, -baseDeductQty, unitId, currentUserId != null ? currentUserId : 1, "Bán lẻ POS đơn: " + orderCode);
            } catch (Exception ex) {
                log.warn("Lỗi ghi inventory_log: {}", ex.getMessage());
            }

            Map<String, Object> lineObj = new LinkedHashMap<>();
            lineObj.put("id", processedLines.size() + 1);
            lineObj.put("productId", productId);
            lineObj.put("productName", pName);
            lineObj.put("skuCode", sku);
            lineObj.put("quantity", quantity);
            lineObj.put("unitName", !reqUnit.isEmpty() ? reqUnit : unitName);
            lineObj.put("unitPrice", unitPrice);
            lineObj.put("lineTotal", lineTotal);
            lineObj.put("totalPrice", lineTotal);
            processedLines.add(lineObj);
        }

        double finalAmount = Math.max(0.0, totalAmount - discount);
        double paidAmount = finalAmount;
        if (body.get("paidAmount") instanceof Number) {
            paidAmount = Math.min(finalAmount, ((Number) body.get("paidAmount")).doubleValue());
        } else if ("DEBT".equalsIgnoreCase(paymentStatus) || "UNPAID".equalsIgnoreCase(paymentStatus)) {
            paidAmount = 0.0;
        }

        // 3. Lưu đơn hàng vào sale_orders
        Long orderId = jdbcTemplate.queryForObject("""
            INSERT INTO sale_orders (
                order_code, customer_id, user_id, total_amount, discount_amount,
                final_amount, paid_amount, status, notes, customer_name, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'DELIVERED', ?, ?, NOW(), NOW())
            RETURNING id
        """, Long.class, orderCode, customerId, currentUserId != null ? currentUserId : 1,
                totalAmount, discount, finalAmount, paidAmount, notes, customerName);

        // 4. Lưu từng dòng vào order_detail
        for (Map<String, Object> line : processedLines) {
            int pId = ((Number) line.get("productId")).intValue();
            double q = ((Number) line.get("quantity")).doubleValue();
            double p = ((Number) line.get("unitPrice")).doubleValue();
            double lt = ((Number) line.get("lineTotal")).doubleValue();

            jdbcTemplate.update("""
                INSERT INTO order_detail (order_id, product_id, quantity, price_at_time, line_total, dispatched_qty)
                VALUES (?, ?, ?, ?, ?, ?)
            """, orderId, pId, q, p, lt, q);
        }

        // 5. Ghi nhận công nợ vào partner_debts nếu bán chịu / nợ
        double debtRemaining = finalAmount - paidAmount;
        if (debtRemaining > 0 && customerId != null && customerId > 1) {
            try {
                jdbcTemplate.update("""
                    INSERT INTO partner_debts (
                        partner_type, customer_id, order_id, total_amount, paid_amount,
                        remaining_amount, due_date, status, notes, created_at, updated_at
                    )
                    VALUES ('CONTRACTOR', ?, ?, ?, ?, ?, CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', ?, NOW(), NOW())
                """, customerId, orderId, finalAmount, paidAmount, debtRemaining, "Ghi nợ đơn hàng " + orderCode);
            } catch (Exception ex) {
                log.warn("Không thể ghi nhận công nợ vào partner_debts: {}", ex.getMessage());
            }
        }

        // 6. Trả về kết quả
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", orderId);
        detail.put("orderCode", orderCode);
        detail.put("customerId", customerId != null ? customerId : 0);
        detail.put("customerName", customerName);
        detail.put("totalAmount", totalAmount);
        detail.put("discountAmount", discount);
        detail.put("finalAmount", finalAmount);
        detail.put("paidAmount", paidAmount);
        detail.put("remainingAmount", debtRemaining);
        detail.put("status", "Delivered");
        detail.put("orderChannel", "Retail");
        detail.put("paymentStatus", debtRemaining > 0 ? "Debt" : "Paid");
        detail.put("itemsCount", processedLines.size());
        detail.put("lines", processedLines);
        detail.put("items", processedLines);
        detail.put("createdAt", LocalDateTime.now().toString());
        detail.put("updatedAt", LocalDateTime.now().toString());

        return detail;
    }
}
