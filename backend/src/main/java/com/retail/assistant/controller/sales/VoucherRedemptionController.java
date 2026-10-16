package com.retail.assistant.controller.sales;

import com.retail.assistant.domain.service.sales.VoucherRedemptionService;
import com.retail.assistant.dto.sales.VoucherRedemptionMapper;
import com.retail.assistant.dto.sales.VoucherRedemptionRequest;
import com.retail.assistant.dto.sales.VoucherRedemptionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sales/voucher-redemption")
public class VoucherRedemptionController {

    private final VoucherRedemptionService service;

    public VoucherRedemptionController(VoucherRedemptionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VoucherRedemptionResponse> create(@RequestBody VoucherRedemptionRequest request) {
        VoucherRedemptionResponse body = VoucherRedemptionMapper.toResponse(service.save(VoucherRedemptionMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public VoucherRedemptionResponse getById(@PathVariable Long id) {
        return VoucherRedemptionMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<VoucherRedemptionResponse> list() {
        return service.findAll().stream().map(VoucherRedemptionMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public VoucherRedemptionResponse update(@PathVariable Long id, @RequestBody VoucherRedemptionRequest request) {
        var entity = service.getById(id);
        VoucherRedemptionMapper.applyTo(entity, request);
        return VoucherRedemptionMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
