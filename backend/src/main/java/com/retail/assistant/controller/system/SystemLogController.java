package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.SystemLogService;
import com.retail.assistant.dto.system.SystemLogMapper;
import com.retail.assistant.dto.system.SystemLogRequest;
import com.retail.assistant.dto.system.SystemLogResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/system-log")
public class SystemLogController {

    private final SystemLogService service;

    public SystemLogController(SystemLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<SystemLogResponse> create(@RequestBody SystemLogRequest request) {
        SystemLogResponse body = SystemLogMapper.toResponse(service.save(SystemLogMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public SystemLogResponse getById(@PathVariable Long id) {
        return SystemLogMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<SystemLogResponse> list() {
        return service.findAll().stream().map(SystemLogMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public SystemLogResponse update(@PathVariable Long id, @RequestBody SystemLogRequest request) {
        var entity = service.getById(id);
        SystemLogMapper.applyTo(entity, request);
        return SystemLogMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
