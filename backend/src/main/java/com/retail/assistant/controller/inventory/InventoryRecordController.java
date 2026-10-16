package com.retail.assistant.controller.inventory;

import com.retail.assistant.domain.service.inventory.InventoryRecordService;
import com.retail.assistant.dto.inventory.InventoryRecordMapper;
import com.retail.assistant.dto.inventory.InventoryRecordRequest;
import com.retail.assistant.dto.inventory.InventoryRecordResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/inventory-record")
public class InventoryRecordController {

    private final InventoryRecordService service;

    public InventoryRecordController(InventoryRecordService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InventoryRecordResponse> create(@RequestBody InventoryRecordRequest request) {
        InventoryRecordResponse body = InventoryRecordMapper.toResponse(service.save(InventoryRecordMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public InventoryRecordResponse getById(@PathVariable Long id) {
        return InventoryRecordMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<InventoryRecordResponse> list() {
        return service.findAll().stream().map(InventoryRecordMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public InventoryRecordResponse update(@PathVariable Long id, @RequestBody InventoryRecordRequest request) {
        var entity = service.getById(id);
        InventoryRecordMapper.applyTo(entity, request);
        return InventoryRecordMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
