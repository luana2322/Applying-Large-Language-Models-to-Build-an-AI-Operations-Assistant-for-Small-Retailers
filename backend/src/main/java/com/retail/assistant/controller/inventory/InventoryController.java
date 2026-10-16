package com.retail.assistant.controller.inventory;

import com.retail.assistant.domain.service.inventory.InventoryStockService;
import com.retail.assistant.dto.inventory.InventoryMapper;
import com.retail.assistant.dto.inventory.InventoryRequest;
import com.retail.assistant.dto.inventory.InventoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/inventory")
public class InventoryController {

    private final InventoryStockService service;

    public InventoryController(InventoryStockService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> create(@RequestBody InventoryRequest request) {
        InventoryResponse body = InventoryMapper.toResponse(service.save(InventoryMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public InventoryResponse getById(@PathVariable Long id) {
        return InventoryMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<InventoryResponse> list() {
        return service.findAll().stream().map(InventoryMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public InventoryResponse update(@PathVariable Long id, @RequestBody InventoryRequest request) {
        var entity = service.getById(id);
        InventoryMapper.applyTo(entity, request);
        return InventoryMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
