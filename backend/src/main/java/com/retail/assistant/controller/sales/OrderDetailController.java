package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.OrderDetailService;
import com.retail.assistant.dto.sales.OrderDetailMapper;
import com.retail.assistant.dto.sales.OrderDetailRequest;
import com.retail.assistant.dto.sales.OrderDetailResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/order-detail")
public class OrderDetailController {

    private final OrderDetailService service;

    public OrderDetailController(OrderDetailService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderDetailResponse> create(@RequestBody OrderDetailRequest request) {
        OrderDetailResponse body = OrderDetailMapper.toResponse(service.save(OrderDetailMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public OrderDetailResponse getById(@PathVariable Long id) {
        return OrderDetailMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<OrderDetailResponse> list() {
        return service.findAll().stream().map(OrderDetailMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public OrderDetailResponse update(@PathVariable Long id, @RequestBody OrderDetailRequest request) {
        var entity = service.getById(id);
        OrderDetailMapper.applyTo(entity, request);
        return OrderDetailMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
