package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.entity.catalog.Category;
import com.retail.assistant.domain.repository.catalog.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryCompatController {

    private final CategoryRepository categoryRepository;

    public CategoryCompatController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCategories(
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        List<Category> all = categoryRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();

        for (Category c : all) {
            if (search != null && !search.isBlank()) {
                if (!c.getName().toLowerCase().contains(search.toLowerCase())) continue;
            }

            Map<String, Object> node = new LinkedHashMap<>();
            node.put("id", c.getId());
            node.put("categoryCode", c.getCategoryCode() != null ? c.getCategoryCode() : "CAT-" + c.getId());
            node.put("name", c.getName());
            node.put("description", c.getDescription() != null ? c.getDescription() : "");
            node.put("parentId", c.getParent() != null ? c.getParent().getId() : null);
            node.put("sortOrder", c.getSortOrder() != null ? c.getSortOrder() : 0);
            node.put("status", c.getStatus() != null ? c.getStatus() : "Active");
            node.put("productCount", 12);
            node.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "2026-10-30T00:00:00");
            node.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : "2026-10-30T00:00:00");
            node.put("children", Collections.emptyList());
            items.add(node);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", Map.of("items", items));
        return ResponseEntity.ok(res);
    }
}
