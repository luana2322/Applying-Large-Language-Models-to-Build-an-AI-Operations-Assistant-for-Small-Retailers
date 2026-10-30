package com.retail.assistant.controller.recommend;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/recommend")
public class RecommendationController {

    private final ProductRepository productRepository;
    private final JdbcTemplate jdbcTemplate;

    public RecommendationController(ProductRepository productRepository, JdbcTemplate jdbcTemplate) {
        this.productRepository = productRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Gợi ý Combo & Phối màu cho một sản phẩm (ví dụ: Lavabo trắng)
     */
    @GetMapping("/combo/{productId}")
    public ResponseEntity<Map<String, Object>> getComboRecommendation(@PathVariable Long productId) {
        Product baseProduct = productRepository.findById(productId).orElse(null);
        if (baseProduct == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Sản phẩm không tồn tại"));
        }

        // Lấy thông số kỹ thuật (màu sắc, kiểu dáng)
        List<Map<String, Object>> specs = jdbcTemplate.queryForList(
                "SELECT color, material, dimensions, finish_style, installation_type FROM product_specifications WHERE product_id = ?",
                productId
        );
        Map<String, Object> specMap = specs.isEmpty() ? Collections.emptyMap() : specs.get(0);

        // Truy vấn các quy tắc combo
        String sql = """
            SELECT r.id, r.rule_name, r.recommended_role, r.recommendation_reason, r.discount_pct, r.priority_score,
                   p.id as prod_id, p.name as prod_name, p.sku_code, p.selling_price, p.image_url, p.unit, p.category_name,
                   inv.quantity as stock_qty
            FROM combo_recommendation_rules r
            JOIN products p ON r.recommended_product_id = p.id
            LEFT JOIN inventory inv ON inv.product_id = p.id
            WHERE r.is_active = TRUE
            ORDER BY r.priority_score DESC, r.id ASC
        """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);

        List<Map<String, Object>> requiredAccessories = new ArrayList<>();
        List<Map<String, Object>> matchingTiles = new ArrayList<>();
        List<Map<String, Object>> complementaryTools = new ArrayList<>();
        double totalComboPrice = baseProduct.getSellingPrice() != null ? baseProduct.getSellingPrice() : 0.0;

        for (Map<String, Object> row : rows) {
            String role = (String) row.get("recommended_role");
            double price = row.get("selling_price") != null ? ((Number) row.get("selling_price")).doubleValue() : 0.0;

            Map<String, Object> item = new HashMap<>();
            item.put("ruleId", row.get("id"));
            item.put("productId", row.get("prod_id"));
            item.put("name", row.get("prod_name"));
            item.put("skuCode", row.get("sku_code"));
            item.put("price", price);
            item.put("unit", row.get("unit"));
            item.put("imageUrl", row.get("image_url"));
            item.put("categoryName", row.get("category_name"));
            item.put("reason", row.get("recommendation_reason"));
            item.put("discountPct", row.get("discount_pct"));
            item.put("stockQuantity", row.get("stock_qty") != null ? ((Number) row.get("stock_qty")).intValue() : 0);

            if ("REQUIRED_ACCESSORY".equals(role)) {
                requiredAccessories.add(item);
                totalComboPrice += price;
            } else if ("MATCHING_COLOR_TILE".equals(role)) {
                matchingTiles.add(item);
            } else {
                complementaryTools.add(item);
            }
        }

        Map<String, Object> colorConsultation = new HashMap<>();
        colorConsultation.put("baseColor", specMap.getOrDefault("color", "Trắng tuyết"));
        colorConsultation.put("styleAdvice", "Lavabo màu trắng mang phong cách tối giản thanh lịch, rất dễ tạo điểm nhấn với gạch men vân đá Calacatta mờ, gạch Terrazzo xám xi măng hoặc gạch thẻ xanh ngọc lục bảo.");
        colorConsultation.put("matchingTileSuggestions", matchingTiles);

        Map<String, Object> comboResult = new HashMap<>();
        comboResult.put("baseProduct", Map.of(
                "id", baseProduct.getId(),
                "name", baseProduct.getName(),
                "skuCode", baseProduct.getSku(),
                "price", baseProduct.getSellingPrice(),
                "imageUrl", baseProduct.getImageUrl(),
                "unit", baseProduct.getUnit(),
                "specifications", specMap
        ));
        comboResult.put("requiredAccessories", requiredAccessories);
        comboResult.put("matchingTiles", matchingTiles);
        comboResult.put("complementaryTools", complementaryTools);
        comboResult.put("totalComboPrice", totalComboPrice);
        comboResult.put("comboDiscountPrice", Math.round(totalComboPrice * 0.95));
        comboResult.put("colorConsultation", colorConsultation);

        return ResponseEntity.ok(Map.of("success", true, "data", comboResult));
    }
}
