package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.service.catalog.ProductImageService;
import com.retail.assistant.dto.catalog.ProductImageMapper;
import com.retail.assistant.dto.catalog.ProductImageRequest;
import com.retail.assistant.dto.catalog.ProductImageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/product-image")
public class ProductImageController {

    private final ProductImageService service;

    public ProductImageController(ProductImageService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductImageResponse> create(@RequestBody ProductImageRequest request) {
        ProductImageResponse body = ProductImageMapper.toResponse(service.save(ProductImageMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public ProductImageResponse getById(@PathVariable Long id) {
        return ProductImageMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<ProductImageResponse> list() {
        return service.findAll().stream().map(ProductImageMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ProductImageResponse update(@PathVariable Long id, @RequestBody ProductImageRequest request) {
        var entity = service.getById(id);
        ProductImageMapper.applyTo(entity, request);
        return ProductImageMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
