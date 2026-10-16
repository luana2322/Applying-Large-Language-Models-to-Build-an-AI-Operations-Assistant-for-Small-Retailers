package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.CustomerService;
import com.retail.assistant.dto.sales.CustomerMapper;
import com.retail.assistant.dto.sales.CustomerRequest;
import com.retail.assistant.dto.sales.CustomerResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/customer")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@RequestBody CustomerRequest request) {
        CustomerResponse body = CustomerMapper.toResponse(service.save(CustomerMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable Long id) {
        return CustomerMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<CustomerResponse> list() {
        return service.findAll().stream().map(CustomerMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @RequestBody CustomerRequest request) {
        var entity = service.getById(id);
        CustomerMapper.applyTo(entity, request);
        return CustomerMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
