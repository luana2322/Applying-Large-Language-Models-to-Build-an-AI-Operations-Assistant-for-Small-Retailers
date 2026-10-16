package com.retail.assistant.controller.finance;

import com.retail.assistant.domain.service.finance.FinanceLedgerService;
import com.retail.assistant.dto.finance.FinanceLedgerMapper;
import com.retail.assistant.dto.finance.FinanceLedgerRequest;
import com.retail.assistant.dto.finance.FinanceLedgerResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/finance-ledger")
public class FinanceLedgerController {

    private final FinanceLedgerService service;

    public FinanceLedgerController(FinanceLedgerService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FinanceLedgerResponse> create(@RequestBody FinanceLedgerRequest request) {
        FinanceLedgerResponse body = FinanceLedgerMapper.toResponse(service.save(FinanceLedgerMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public FinanceLedgerResponse getById(@PathVariable Long id) {
        return FinanceLedgerMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<FinanceLedgerResponse> list() {
        return service.findAll().stream().map(FinanceLedgerMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public FinanceLedgerResponse update(@PathVariable Long id, @RequestBody FinanceLedgerRequest request) {
        var entity = service.getById(id);
        FinanceLedgerMapper.applyTo(entity, request);
        return FinanceLedgerMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
