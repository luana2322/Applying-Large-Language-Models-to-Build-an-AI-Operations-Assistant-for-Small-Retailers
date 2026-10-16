package com.retail.assistant.controller.audit;

import com.retail.assistant.domain.service.audit.AuditLogService;
import com.retail.assistant.dto.audit.AuditLogMapper;
import com.retail.assistant.dto.audit.AuditLogRequest;
import com.retail.assistant.dto.audit.AuditLogResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit/audit-log")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AuditLogResponse> create(@RequestBody AuditLogRequest request) {
        AuditLogResponse body = AuditLogMapper.toResponse(service.save(AuditLogMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public AuditLogResponse getById(@PathVariable Long id) {
        return AuditLogMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<AuditLogResponse> list() {
        return service.findAll().stream().map(AuditLogMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public AuditLogResponse update(@PathVariable Long id, @RequestBody AuditLogRequest request) {
        var entity = service.getById(id);
        AuditLogMapper.applyTo(entity, request);
        return AuditLogMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
