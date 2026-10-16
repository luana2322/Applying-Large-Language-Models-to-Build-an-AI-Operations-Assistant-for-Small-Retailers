package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.VoucherService;
import com.retail.assistant.dto.sales.VoucherMapper;
import com.retail.assistant.dto.sales.VoucherRequest;
import com.retail.assistant.dto.sales.VoucherResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/voucher")
public class VoucherController {

    private final VoucherService service;

    public VoucherController(VoucherService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VoucherResponse> create(@RequestBody VoucherRequest request) {
        VoucherResponse body = VoucherMapper.toResponse(service.save(VoucherMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public VoucherResponse getById(@PathVariable Long id) {
        return VoucherMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<VoucherResponse> list() {
        return service.findAll().stream().map(VoucherMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public VoucherResponse update(@PathVariable Long id, @RequestBody VoucherRequest request) {
        var entity = service.getById(id);
        VoucherMapper.applyTo(entity, request);
        return VoucherMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
