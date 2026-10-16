package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.service.catalog.ProductUnitService;
import com.retail.assistant.dto.catalog.ProductUnitMapper;
import com.retail.assistant.dto.catalog.ProductUnitRequest;
import com.retail.assistant.dto.catalog.ProductUnitResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/product-unit")
public class ProductUnitController {

    private final ProductUnitService service;

    public ProductUnitController(ProductUnitService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductUnitResponse> create(@RequestBody ProductUnitRequest request) {
        ProductUnitResponse body = ProductUnitMapper.toResponse(service.save(ProductUnitMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public ProductUnitResponse getById(@PathVariable Long id) {
        return ProductUnitMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<ProductUnitResponse> list() {
        return service.findAll().stream().map(ProductUnitMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ProductUnitResponse update(@PathVariable Long id, @RequestBody ProductUnitRequest request) {
        var entity = service.getById(id);
        ProductUnitMapper.applyTo(entity, request);
        return ProductUnitMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
