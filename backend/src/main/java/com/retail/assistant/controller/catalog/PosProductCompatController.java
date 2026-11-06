package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/pos/products")
public class PosProductCompatController {

    private final ProductRepository productRepository;
    private final JdbcTemplate jdbcTemplate;

    public PosProductCompatController(ProductRepository productRepository, JdbcTemplate jdbcTemplate) {
        this.productRepository = productRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> searchPosProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "40") int limit
    ) {
        List<Product> all = productRepository.findAll();

        // Load all unit conversions
        Map<Long, List<Map<String, Object>>> conversionsByProduct = new HashMap<>();
        try {
            List<Map<String, Object>> convRows = jdbcTemplate.queryForList("""
                SELECT product_id, base_unit, packaging_unit, conversion_rate, is_default_sales_unit
                FROM product_unit_conversions
            """);
            for (Map<String, Object> r : convRows) {
                Long pId = ((Number) r.get("product_id")).longValue();
                conversionsByProduct.computeIfAbsent(pId, k -> new ArrayList<>()).add(r);
            }
        } catch (Exception ignored) {}

        // Load REAL-TIME stock from inventory table
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

        List<Map<String, Object>> items = new ArrayList<>();

        for (Product p : all) {
            if (categoryId != null && categoryId > 0) {
                if (p.getCategoryEntity() == null || !p.getCategoryEntity().getId().equals(categoryId)) {
                    continue;
                }
            }

            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = (p.getName() != null && p.getName().toLowerCase().contains(q)) ||
                                (p.getSkuCode() != null && p.getSkuCode().toLowerCase().contains(q)) ||
                                (p.getBarcode() != null && p.getBarcode().toLowerCase().contains(q));
                if (!match) continue;
            }

            double basePrice = p.getSellingPrice() != null ? p.getSellingPrice() : 100000.0;
            String baseUnit = p.getUnit() != null ? p.getUnit() : "Cái";

            // Prepare list of available units for POS selection
            List<Map<String, Object>> units = new ArrayList<>();
            // 1. Base unit
            units.add(Map.of(
                "unitId", 1,
                "unitName", baseUnit,
                "conversionRate", 1.0,
                "price", basePrice,
                "isBase", true
            ));

            // 2. Packaging / Conversion units
            List<Map<String, Object>> convList = conversionsByProduct.get(p.getId());
            if (convList != null) {
                int uIdx = 2;
                for (Map<String, Object> c : convList) {
                    String pkgUnit = (String) c.get("packaging_unit");
                    double rate = ((Number) c.get("conversion_rate")).doubleValue();
                    double unitPrice = Math.round(basePrice * rate);
                    units.add(Map.of(
                        "unitId", uIdx++,
                        "unitName", pkgUnit,
                        "conversionRate", rate,
                        "price", unitPrice,
                        "isBase", false
                    ));
                }
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("productId", p.getId());
            row.put("productName", p.getName());
            row.put("skuCode", p.getSkuCode() != null ? p.getSkuCode() : "SKU-" + p.getId());
            row.put("barcode", p.getBarcode() != null ? p.getBarcode() : "893600" + p.getId());
            row.put("unitId", 1);
            double realStock = stockByProduct.getOrDefault(p.getId(), 0.0);
            row.put("unitName", baseUnit);
            row.put("unitPrice", basePrice);
            row.put("availableQty", Math.max(0, realStock));
            row.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400");
            row.put("availableUnits", units);

            items.add(row);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("total", items.size());
        data.put("page", page);
        data.put("limit", limit);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
