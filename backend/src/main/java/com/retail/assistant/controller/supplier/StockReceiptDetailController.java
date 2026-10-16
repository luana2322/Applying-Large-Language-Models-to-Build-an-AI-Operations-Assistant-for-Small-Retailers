package com.retail.assistant.controller.supplier;

import com.retail.assistant.domain.service.supplier.StockReceiptDetailService;
import com.retail.assistant.dto.supplier.StockReceiptDetailMapper;
import com.retail.assistant.dto.supplier.StockReceiptDetailRequest;
import com.retail.assistant.dto.supplier.StockReceiptDetailResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/supplier/stock-receipt-detail")
public class StockReceiptDetailController {

    private final StockReceiptDetailService service;

    public StockReceiptDetailController(StockReceiptDetailService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StockReceiptDetailResponse> create(@RequestBody StockReceiptDetailRequest request) {
        StockReceiptDetailResponse body = StockReceiptDetailMapper.toResponse(service.save(StockReceiptDetailMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StockReceiptDetailResponse getById(@PathVariable Long id) {
        return StockReceiptDetailMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StockReceiptDetailResponse> list() {
        return service.findAll().stream().map(StockReceiptDetailMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StockReceiptDetailResponse update(@PathVariable Long id, @RequestBody StockReceiptDetailRequest request) {
        var entity = service.getById(id);
        StockReceiptDetailMapper.applyTo(entity, request);
        return StockReceiptDetailMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
