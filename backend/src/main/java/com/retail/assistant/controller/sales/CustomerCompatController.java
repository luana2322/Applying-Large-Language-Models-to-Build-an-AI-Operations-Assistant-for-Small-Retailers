package com.retail.assistant.controller.sales;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerCompatController {

    private final JdbcTemplate jdbcTemplate;

    public CustomerCompatController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT c.id, c.customer_code, c.name, c.phone, c.email, c.addr,
                   c.loyalty_points, c.total_spent, c.status, c.created_at, c.updated_at,
                   c.credit_limit,
                   COALESCE(SUM(d.remaining_amount), 0) as current_debt,
                   COUNT(DISTINCT d.id) as debt_count,
                   MAX(d.overdue_days) as max_overdue_days
            FROM customers c
            LEFT JOIN partner_debts d ON c.id = d.customer_id AND d.status != 'CLEARED'
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();
        if (search != null && !search.isBlank()) {
            sql.append(" AND (c.name ILIKE ? OR c.phone ILIKE ? OR c.customer_code ILIKE ?)");
            String q = "%" + search.trim() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        if (status != null && !status.equalsIgnoreCase("all")) {
            sql.append(" AND c.status = ?");
            params.add(status.toUpperCase());
        }

        sql.append(" GROUP BY c.id ORDER BY c.id ASC");

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        List<Map<String, Object>> items = new ArrayList<>();

        for (Map<String, Object> r : rows) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.get("id"));
            item.put("customerCode", r.get("customer_code"));
            item.put("name", r.get("name"));
            item.put("phone", r.get("phone"));
            item.put("email", r.get("email"));
            item.put("address", r.get("addr"));
            item.put("loyaltyPoints", r.get("loyalty_points"));
            item.put("totalSpent", r.get("total_spent"));
            item.put("status", r.get("status") != null ? r.get("status").toString() : "ACTIVE");
            item.put("orderCount", 5);
            item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "");
            item.put("updatedAt", r.get("updated_at") != null ? r.get("updated_at").toString() : "");

            // Credit guardrail fields
            double creditLimit = r.get("credit_limit") != null ? ((Number) r.get("credit_limit")).doubleValue() : 50000000.0;
            double currentDebt = r.get("current_debt") != null ? ((Number) r.get("current_debt")).doubleValue() : 0.0;
            int maxOverdue = r.get("max_overdue_days") != null ? ((Number) r.get("max_overdue_days")).intValue() : 0;

            item.put("creditLimit", creditLimit);
            item.put("currentDebt", currentDebt);
            item.put("maxOverdueDays", maxOverdue);
            item.put("isExceededCredit", currentDebt > creditLimit);
            item.put("isOverdue", maxOverdue > 0);

            items.add(item);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("total", items.size());
        data.put("page", page);
        data.put("limit", limit);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
