package com.retail.assistant.controller.catalog;

import com.retail.assistant.domain.service.catalog.ProductPriceHistoryService;
import com.retail.assistant.dto.catalog.ProductPriceHistoryMapper;
import com.retail.assistant.dto.catalog.ProductPriceHistoryRequest;
import com.retail.assistant.dto.catalog.ProductPriceHistoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/product-price-history")
public class ProductPriceHistoryController {

    private final ProductPriceHistoryService service;

    public ProductPriceHistoryController(ProductPriceHistoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductPriceHistoryResponse> create(@RequestBody ProductPriceHistoryRequest request) {
        ProductPriceHistoryResponse body = ProductPriceHistoryMapper.toResponse(service.save(ProductPriceHistoryMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public ProductPriceHistoryResponse getById(@PathVariable Long id) {
        return ProductPriceHistoryMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<ProductPriceHistoryResponse> list() {
        return service.findAll().stream().map(ProductPriceHistoryMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ProductPriceHistoryResponse update(@PathVariable Long id, @RequestBody ProductPriceHistoryRequest request) {
        var entity = service.getById(id);
        ProductPriceHistoryMapper.applyTo(entity, request);
        return ProductPriceHistoryMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
