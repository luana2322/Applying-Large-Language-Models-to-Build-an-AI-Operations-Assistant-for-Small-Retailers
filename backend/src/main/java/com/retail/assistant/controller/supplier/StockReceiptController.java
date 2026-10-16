package com.retail.assistant.controller.supplier;

import com.retail.assistant.domain.service.supplier.StockReceiptService;
import com.retail.assistant.dto.supplier.StockReceiptMapper;
import com.retail.assistant.dto.supplier.StockReceiptRequest;
import com.retail.assistant.dto.supplier.StockReceiptResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/supplier/stock-receipt")
public class StockReceiptController {

    private final StockReceiptService service;

    public StockReceiptController(StockReceiptService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StockReceiptResponse> create(@RequestBody StockReceiptRequest request) {
        StockReceiptResponse body = StockReceiptMapper.toResponse(service.save(StockReceiptMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StockReceiptResponse getById(@PathVariable Long id) {
        return StockReceiptMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StockReceiptResponse> list() {
        return service.findAll().stream().map(StockReceiptMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StockReceiptResponse update(@PathVariable Long id, @RequestBody StockReceiptRequest request) {
        var entity = service.getById(id);
        StockReceiptMapper.applyTo(entity, request);
        return StockReceiptMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
