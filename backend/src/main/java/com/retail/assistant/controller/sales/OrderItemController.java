package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.OrderItemService;
import com.retail.assistant.dto.sales.OrderItemMapper;
import com.retail.assistant.dto.sales.OrderItemRequest;
import com.retail.assistant.dto.sales.OrderItemResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/order-item")
public class OrderItemController {

    private final OrderItemService service;

    public OrderItemController(OrderItemService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderItemResponse> create(@RequestBody OrderItemRequest request) {
        OrderItemResponse body = OrderItemMapper.toResponse(service.save(OrderItemMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public OrderItemResponse getById(@PathVariable Long id) {
        return OrderItemMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<OrderItemResponse> list() {
        return service.findAll().stream().map(OrderItemMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public OrderItemResponse update(@PathVariable Long id, @RequestBody OrderItemRequest request) {
        var entity = service.getById(id);
        OrderItemMapper.applyTo(entity, request);
        return OrderItemMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
