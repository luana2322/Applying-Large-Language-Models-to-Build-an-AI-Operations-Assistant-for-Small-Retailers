package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.OrderService;
import com.retail.assistant.dto.sales.OrderMapper;
import com.retail.assistant.dto.sales.OrderRequest;
import com.retail.assistant.dto.sales.OrderResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/order")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@RequestBody OrderRequest request) {
        OrderResponse body = OrderMapper.toResponse(service.save(OrderMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return OrderMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<OrderResponse> list() {
        return service.findAll().stream().map(OrderMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public OrderResponse update(@PathVariable Long id, @RequestBody OrderRequest request) {
        var entity = service.getById(id);
        OrderMapper.applyTo(entity, request);
        return OrderMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
