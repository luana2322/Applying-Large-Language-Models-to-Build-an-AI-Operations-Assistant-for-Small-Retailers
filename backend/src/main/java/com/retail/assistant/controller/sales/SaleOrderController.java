package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.SaleOrderService;
import com.retail.assistant.dto.sales.SaleOrderMapper;
import com.retail.assistant.dto.sales.SaleOrderRequest;
import com.retail.assistant.dto.sales.SaleOrderResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/sale-order")
public class SaleOrderController {

    private final SaleOrderService service;

    public SaleOrderController(SaleOrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SaleOrderResponse> create(@RequestBody SaleOrderRequest request) {
        SaleOrderResponse body = SaleOrderMapper.toResponse(service.save(SaleOrderMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public SaleOrderResponse getById(@PathVariable Long id) {
        return SaleOrderMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<SaleOrderResponse> list() {
        return service.findAll().stream().map(SaleOrderMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public SaleOrderResponse update(@PathVariable Long id, @RequestBody SaleOrderRequest request) {
        var entity = service.getById(id);
        SaleOrderMapper.applyTo(entity, request);
        return SaleOrderMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
