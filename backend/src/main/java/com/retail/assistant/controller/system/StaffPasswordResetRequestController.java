package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.StaffPasswordResetRequestService;
import com.retail.assistant.dto.system.StaffPasswordResetRequestMapper;
import com.retail.assistant.dto.system.StaffPasswordResetRequestRequest;
import com.retail.assistant.dto.system.StaffPasswordResetRequestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/staff-password-reset-request")
public class StaffPasswordResetRequestController {

    private final StaffPasswordResetRequestService service;

    public StaffPasswordResetRequestController(StaffPasswordResetRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StaffPasswordResetRequestResponse> create(@RequestBody StaffPasswordResetRequestRequest request) {
        StaffPasswordResetRequestResponse body = StaffPasswordResetRequestMapper.toResponse(service.save(StaffPasswordResetRequestMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StaffPasswordResetRequestResponse getById(@PathVariable Long id) {
        return StaffPasswordResetRequestMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StaffPasswordResetRequestResponse> list() {
        return service.findAll().stream().map(StaffPasswordResetRequestMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StaffPasswordResetRequestResponse update(@PathVariable Long id, @RequestBody StaffPasswordResetRequestRequest request) {
        var entity = service.getById(id);
        StaffPasswordResetRequestMapper.applyTo(entity, request);
        return StaffPasswordResetRequestMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
