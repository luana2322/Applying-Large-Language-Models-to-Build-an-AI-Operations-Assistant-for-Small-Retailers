package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.OrderPaymentService;
import com.retail.assistant.dto.sales.OrderPaymentMapper;
import com.retail.assistant.dto.sales.OrderPaymentRequest;
import com.retail.assistant.dto.sales.OrderPaymentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/order-payment")
public class OrderPaymentController {

    private final OrderPaymentService service;

    public OrderPaymentController(OrderPaymentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderPaymentResponse> create(@RequestBody OrderPaymentRequest request) {
        OrderPaymentResponse body = OrderPaymentMapper.toResponse(service.save(OrderPaymentMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public OrderPaymentResponse getById(@PathVariable Long id) {
        return OrderPaymentMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<OrderPaymentResponse> list() {
        return service.findAll().stream().map(OrderPaymentMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public OrderPaymentResponse update(@PathVariable Long id, @RequestBody OrderPaymentRequest request) {
        var entity = service.getById(id);
        OrderPaymentMapper.applyTo(entity, request);
        return OrderPaymentMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
