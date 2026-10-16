package com.retail.assistant.controller.inventory;

import com.retail.assistant.domain.service.inventory.StockDispatchService;
import com.retail.assistant.dto.inventory.StockDispatchMapper;
import com.retail.assistant.dto.inventory.StockDispatchRequest;
import com.retail.assistant.dto.inventory.StockDispatchResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/stock-dispatch")
public class StockDispatchController {

    private final StockDispatchService service;

    public StockDispatchController(StockDispatchService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StockDispatchResponse> create(@RequestBody StockDispatchRequest request) {
        StockDispatchResponse body = StockDispatchMapper.toResponse(service.save(StockDispatchMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StockDispatchResponse getById(@PathVariable Long id) {
        return StockDispatchMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StockDispatchResponse> list() {
        return service.findAll().stream().map(StockDispatchMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StockDispatchResponse update(@PathVariable Long id, @RequestBody StockDispatchRequest request) {
        var entity = service.getById(id);
        StockDispatchMapper.applyTo(entity, request);
        return StockDispatchMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
