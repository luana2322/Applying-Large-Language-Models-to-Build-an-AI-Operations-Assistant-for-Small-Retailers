package com.retail.assistant.controller.finance;

import com.retail.assistant.domain.service.finance.CashFundService;
import com.retail.assistant.dto.finance.CashFundMapper;
import com.retail.assistant.dto.finance.CashFundRequest;
import com.retail.assistant.dto.finance.CashFundResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/cash-fund")
public class CashFundController {

    private final CashFundService service;

    public CashFundController(CashFundService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CashFundResponse> create(@RequestBody CashFundRequest request) {
        CashFundResponse body = CashFundMapper.toResponse(service.save(CashFundMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public CashFundResponse getById(@PathVariable Long id) {
        return CashFundMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<CashFundResponse> list() {
        return service.findAll().stream().map(CashFundMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CashFundResponse update(@PathVariable Long id, @RequestBody CashFundRequest request) {
        var entity = service.getById(id);
        CashFundMapper.applyTo(entity, request);
        return CashFundMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
