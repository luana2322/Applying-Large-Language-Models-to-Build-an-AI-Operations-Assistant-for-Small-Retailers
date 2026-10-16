package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.service.catalog.ProductService;
import com.retail.assistant.dto.catalog.ProductMapper;
import com.retail.assistant.dto.catalog.ProductRequest;
import com.retail.assistant.dto.catalog.ProductResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/product")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody ProductRequest request) {
        ProductResponse body = ProductMapper.toResponse(service.save(ProductMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return ProductMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<ProductResponse> list() {
        return service.findAll().stream().map(ProductMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @RequestBody ProductRequest request) {
        var entity = service.getById(id);
        ProductMapper.applyTo(entity, request);
        return ProductMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
