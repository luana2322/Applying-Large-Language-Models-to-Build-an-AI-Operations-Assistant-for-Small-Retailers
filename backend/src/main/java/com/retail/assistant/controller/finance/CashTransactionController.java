package com.retail.assistant.controller.finance;

import com.retail.assistant.domain.service.finance.CashTransactionService;
import com.retail.assistant.dto.finance.CashTransactionMapper;
import com.retail.assistant.dto.finance.CashTransactionRequest;
import com.retail.assistant.dto.finance.CashTransactionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/cash-transaction")
public class CashTransactionController {

    private final CashTransactionService service;

    public CashTransactionController(CashTransactionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CashTransactionResponse> create(@RequestBody CashTransactionRequest request) {
        CashTransactionResponse body = CashTransactionMapper.toResponse(service.save(CashTransactionMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public CashTransactionResponse getById(@PathVariable Long id) {
        return CashTransactionMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<CashTransactionResponse> list() {
        return service.findAll().stream().map(CashTransactionMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CashTransactionResponse update(@PathVariable Long id, @RequestBody CashTransactionRequest request) {
        var entity = service.getById(id);
        CashTransactionMapper.applyTo(entity, request);
        return CashTransactionMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
