package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.AlertSettingService;
import com.retail.assistant.dto.system.AlertSettingMapper;
import com.retail.assistant.dto.system.AlertSettingRequest;
import com.retail.assistant.dto.system.AlertSettingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/alert-setting")
public class AlertSettingController {

    private final AlertSettingService service;

    public AlertSettingController(AlertSettingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AlertSettingResponse> create(@RequestBody AlertSettingRequest request) {
        AlertSettingResponse body = AlertSettingMapper.toResponse(service.save(AlertSettingMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public AlertSettingResponse getById(@PathVariable Long id) {
        return AlertSettingMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<AlertSettingResponse> list() {
        return service.findAll().stream().map(AlertSettingMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public AlertSettingResponse update(@PathVariable Long id, @RequestBody AlertSettingRequest request) {
        var entity = service.getById(id);
        AlertSettingMapper.applyTo(entity, request);
        return AlertSettingMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
