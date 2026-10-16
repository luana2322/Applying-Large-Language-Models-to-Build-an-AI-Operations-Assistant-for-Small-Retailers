package com.retail.assistant.controller.inventory;

import com.retail.assistant.domain.service.inventory.StockDispatchLineService;
import com.retail.assistant.dto.inventory.StockDispatchLineMapper;
import com.retail.assistant.dto.inventory.StockDispatchLineRequest;
import com.retail.assistant.dto.inventory.StockDispatchLineResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/stock-dispatch-line")
public class StockDispatchLineController {

    private final StockDispatchLineService service;

    public StockDispatchLineController(StockDispatchLineService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StockDispatchLineResponse> create(@RequestBody StockDispatchLineRequest request) {
        StockDispatchLineResponse body = StockDispatchLineMapper.toResponse(service.save(StockDispatchLineMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StockDispatchLineResponse getById(@PathVariable Long id) {
        return StockDispatchLineMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StockDispatchLineResponse> list() {
        return service.findAll().stream().map(StockDispatchLineMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StockDispatchLineResponse update(@PathVariable Long id, @RequestBody StockDispatchLineRequest request) {
        var entity = service.getById(id);
        StockDispatchLineMapper.applyTo(entity, request);
        return StockDispatchLineMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
