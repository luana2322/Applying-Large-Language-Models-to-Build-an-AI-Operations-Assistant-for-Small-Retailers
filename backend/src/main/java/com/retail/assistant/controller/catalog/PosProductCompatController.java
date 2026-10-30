package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.entity.catalog.Product;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/pos/products")
public class PosProductCompatController {

    private final ProductRepository productRepository;

    public PosProductCompatController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> searchPosProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "40") int limit
    ) {
        List<Product> all = productRepository.findAll();
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

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("productId", p.getId());
            row.put("productName", p.getName());
            row.put("skuCode", p.getSkuCode() != null ? p.getSkuCode() : "SKU-" + p.getId());
            row.put("barcode", p.getBarcode() != null ? p.getBarcode() : "893600" + p.getId());
            row.put("unitId", 1);
            row.put("unitName", p.getUnit() != null ? p.getUnit() : "Cái");
            row.put("unitPrice", p.getSellingPrice() != null ? p.getSellingPrice() : 100000);
            row.put("availableQty", 50);
            row.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400");
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
