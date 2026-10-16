package com.retail.assistant.controller.supplier;

import com.retail.assistant.domain.service.supplier.SupplierService;
import com.retail.assistant.dto.supplier.SupplierMapper;
import com.retail.assistant.dto.supplier.SupplierRequest;
import com.retail.assistant.dto.supplier.SupplierResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/supplier/supplier")
public class SupplierController {

    private final SupplierService service;

    public SupplierController(SupplierService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> create(@RequestBody SupplierRequest request) {
        SupplierResponse body = SupplierMapper.toResponse(service.save(SupplierMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public SupplierResponse getById(@PathVariable Long id) {
        return SupplierMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<SupplierResponse> list() {
        return service.findAll().stream().map(SupplierMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public SupplierResponse update(@PathVariable Long id, @RequestBody SupplierRequest request) {
        var entity = service.getById(id);
        SupplierMapper.applyTo(entity, request);
        return SupplierMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
