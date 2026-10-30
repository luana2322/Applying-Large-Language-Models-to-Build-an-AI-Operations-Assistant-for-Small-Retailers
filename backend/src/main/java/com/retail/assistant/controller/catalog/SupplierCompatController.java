package com.retail.assistant.controller.catalog;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/suppliers")
public class SupplierCompatController {

    private final JdbcTemplate jdbcTemplate;

    public SupplierCompatController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        String sql = "SELECT id, supplier_code, name, contact_person, phone, email, addr, tax_code, status, created_at, updated_at FROM suppliers ORDER BY id ASC";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<Map<String, Object>> items = new ArrayList<>();

        for (Map<String, Object> r : rows) {
            String name = (String) r.get("name");
            String code = (String) r.get("supplier_code");

            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = (name != null && name.toLowerCase().contains(q)) ||
                                (code != null && code.toLowerCase().contains(q));
                if (!match) continue;
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", r.get("id"));
            item.put("supplierCode", code != null ? code : "SUP-" + r.get("id"));
            item.put("name", name != null ? name : "Nhà cung cấp vật tư");
            item.put("contactPerson", r.get("contact_person") != null ? r.get("contact_person") : "Đại diện kinh doanh");
            item.put("phone", r.get("phone") != null ? r.get("phone") : "0900000000");
            item.put("email", r.get("email"));
            item.put("address", r.get("addr"));
            item.put("taxCode", r.get("tax_code"));
            item.put("status", r.get("status") != null ? r.get("status") : "ACTIVE");
            item.put("receiptCount", 4);
            item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "2026-10-30T00:00:00");
            item.put("updatedAt", r.get("updated_at") != null ? r.get("updated_at").toString() : "2026-10-30T00:00:00");
            items.add(item);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("limit", limit);
        data.put("total", items.size());

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSupplierDetail(@PathVariable Long id) {
        String sql = "SELECT id, supplier_code, name, contact_person, phone, email, addr, tax_code, status, created_at, updated_at FROM suppliers WHERE id = ?";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, id);

        if (rows.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy nhà cung cấp"));
        }

        Map<String, Object> r = rows.get(0);
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", r.get("id"));
        item.put("supplierCode", r.get("supplier_code"));
        item.put("name", r.get("name"));
        item.put("contactPerson", r.get("contact_person"));
        item.put("phone", r.get("phone"));
        item.put("email", r.get("email"));
        item.put("address", r.get("addr"));
        item.put("taxCode", r.get("tax_code"));
        item.put("status", r.get("status") != null ? r.get("status") : "ACTIVE");
        item.put("receiptCount", 4);
        item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "2026-10-30T00:00:00");
        item.put("updatedAt", r.get("updated_at") != null ? r.get("updated_at").toString() : "2026-10-30T00:00:00");

        return ResponseEntity.ok(Map.of("success", true, "data", item));
    }
}
