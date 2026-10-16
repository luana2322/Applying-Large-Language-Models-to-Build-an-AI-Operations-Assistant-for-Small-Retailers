package com.retail.assistant.controller.inventory;

import com.retail.assistant.domain.service.inventory.InventoryLogService;
import com.retail.assistant.dto.inventory.InventoryLogMapper;
import com.retail.assistant.dto.inventory.InventoryLogRequest;
import com.retail.assistant.dto.inventory.InventoryLogResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/inventory-log")
public class InventoryLogController {

    private final InventoryLogService service;

    public InventoryLogController(InventoryLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InventoryLogResponse> create(@RequestBody InventoryLogRequest request) {
        InventoryLogResponse body = InventoryLogMapper.toResponse(service.save(InventoryLogMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public InventoryLogResponse getById(@PathVariable Long id) {
        return InventoryLogMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<InventoryLogResponse> list() {
        return service.findAll().stream().map(InventoryLogMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public InventoryLogResponse update(@PathVariable Long id, @RequestBody InventoryLogRequest request) {
        var entity = service.getById(id);
        InventoryLogMapper.applyTo(entity, request);
        return InventoryLogMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
