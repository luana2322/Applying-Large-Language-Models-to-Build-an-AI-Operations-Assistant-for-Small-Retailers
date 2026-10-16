package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.service.catalog.CategoryService;
import com.retail.assistant.dto.catalog.CategoryMapper;
import com.retail.assistant.dto.catalog.CategoryRequest;
import com.retail.assistant.dto.catalog.CategoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/category")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@RequestBody CategoryRequest request) {
        CategoryResponse body = CategoryMapper.toResponse(service.save(CategoryMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public CategoryResponse getById(@PathVariable Long id) {
        return CategoryMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return service.findAll().stream().map(CategoryMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @RequestBody CategoryRequest request) {
        var entity = service.getById(id);
        CategoryMapper.applyTo(entity, request);
        return CategoryMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
