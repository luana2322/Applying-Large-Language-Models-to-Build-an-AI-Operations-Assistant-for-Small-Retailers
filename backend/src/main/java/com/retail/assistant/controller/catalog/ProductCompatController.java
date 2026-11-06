package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.entity.catalog.Category;
import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.entity.inventory.Inventory;
import com.retail.assistant.domain.repository.catalog.CategoryRepository;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import com.retail.assistant.domain.repository.inventory.InventoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class ProductCompatController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final JdbcTemplate jdbcTemplate;

    public ProductCompatController(ProductRepository productRepository,
                                   CategoryRepository categoryRepository,
                                   InventoryRepository inventoryRepository,
                                   JdbcTemplate jdbcTemplate) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status) {

        // Query real-time total stock by product
        Map<Long, Double> stockByProduct = new HashMap<>();
        try {
            List<Map<String, Object>> stockRows = jdbcTemplate.queryForList("""
                SELECT product_id, COALESCE(SUM(quantity), 0) as total_qty
                FROM inventory
                GROUP BY product_id
            """);
            for (Map<String, Object> sr : stockRows) {
                Long pId = ((Number) sr.get("product_id")).longValue();
                double tq = ((Number) sr.get("total_qty")).doubleValue();
                stockByProduct.put(pId, tq);
            }
        } catch (Exception ignored) {}

        List<Product> all = productRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();

        for (Product p : all) {
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = (p.getName() != null && p.getName().toLowerCase().contains(q)) ||
                                (p.getSku() != null && p.getSku().toLowerCase().contains(q)) ||
                                (p.getBarcode() != null && p.getBarcode().toLowerCase().contains(q));
                if (!match) continue;
            }
            if (categoryId != null && p.getCategoryEntity() != null && !Objects.equals(p.getCategoryEntity().getId(), categoryId)) {
                continue;
            }
            if (status != null && !status.isBlank() && !Objects.equals(p.getStatus(), status)) {
                continue;
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("skuCode", p.getSku() != null ? p.getSku() : "");
            item.put("barcode", p.getBarcode());
            item.put("name", p.getName() != null ? p.getName() : "");
            item.put("categoryId", p.getCategoryEntity() != null ? p.getCategoryEntity().getId() : null);
            item.put("categoryName", p.getCategoryEntity() != null ? p.getCategoryEntity().getName() : (p.getCategoryName() != null ? p.getCategoryName() : ""));
            item.put("imageUrl", p.getImageUrl());
            item.put("status", p.getStatus() != null ? p.getStatus() : "ACTIVE");
            
            // Current real-time stock
            double stock = stockByProduct.getOrDefault(p.getId(), 0.0);
            item.put("currentStock", (int) Math.round(stock));
            item.put("currentPrice", p.getSellingPrice() != null ? p.getSellingPrice() : 0.0);
            item.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            item.put("updatedAt", p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : "");

            items.add(item);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("items", items);
        res.put("page", page);
        res.put("limit", limit);
        res.put("total", items.size());

        Map<String, Object> envelope = new HashMap<>();
        envelope.put("success", true);
        envelope.put("data", res);

        return ResponseEntity.ok(envelope);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        Product p = productRepository.findById(id).orElse(null);
        if (p == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Sản phẩm không tồn tại");
            return ResponseEntity.status(404).body(err);
        }

        Map<String, Object> dto = new HashMap<>();
        dto.put("id", p.getId());
        dto.put("skuCode", p.getSku() != null ? p.getSku() : "");
        dto.put("barcode", p.getBarcode());
        dto.put("name", p.getName() != null ? p.getName() : "");
        dto.put("categoryId", p.getCategoryEntity() != null ? p.getCategoryEntity().getId() : null);
        dto.put("categoryName", p.getCategoryEntity() != null ? p.getCategoryEntity().getName() : (p.getCategoryName() != null ? p.getCategoryName() : ""));
        dto.put("description", p.getDescription());
        dto.put("weight", p.getWeight());
        dto.put("status", p.getStatus());
        dto.put("imageUrl", p.getImageUrl());
        dto.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
        dto.put("updatedAt", p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : "");
        dto.put("units", List.of(
            Map.of("id", 1, "unitName", p.getUnit() != null ? p.getUnit() : "Cái", "conversionRate", 1.0, "isBaseUnit", true, "currentCostPrice", p.getCostPrice() != null ? p.getCostPrice() : 0.0, "currentSalePrice", p.getSellingPrice() != null ? p.getSellingPrice() : 0.0)
        ));
        dto.put("images", p.getImageUrl() != null ? List.of(Map.of("id", 1, "url", p.getImageUrl(), "sortOrder", 1, "isPrimary", true)) : List.of());

        Map<String, Object> envelope = new HashMap<>();
        envelope.put("success", true);
        envelope.put("data", dto);

        return ResponseEntity.ok(envelope);
    }
}
