package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.RoleService;
import com.retail.assistant.dto.system.RoleMapper;
import com.retail.assistant.dto.system.RoleRequest;
import com.retail.assistant.dto.system.RoleResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/role")
public class RoleController {

    private final RoleService service;

    public RoleController(RoleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RoleResponse> create(@RequestBody RoleRequest request) {
        RoleResponse body = RoleMapper.toResponse(service.save(RoleMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public RoleResponse getById(@PathVariable Long id) {
        return RoleMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<RoleResponse> list() {
        return service.findAll().stream().map(RoleMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public RoleResponse update(@PathVariable Long id, @RequestBody RoleRequest request) {
        var entity = service.getById(id);
        RoleMapper.applyTo(entity, request);
        return RoleMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
