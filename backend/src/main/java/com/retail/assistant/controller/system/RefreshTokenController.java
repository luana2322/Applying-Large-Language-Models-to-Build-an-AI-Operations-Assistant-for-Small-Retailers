package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.RefreshTokenService;
import com.retail.assistant.dto.system.RefreshTokenMapper;
import com.retail.assistant.dto.system.RefreshTokenRequest;
import com.retail.assistant.dto.system.RefreshTokenResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/refresh-token")
public class RefreshTokenController {

    private final RefreshTokenService service;

    public RefreshTokenController(RefreshTokenService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<RefreshTokenResponse> create(@RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse body = RefreshTokenMapper.toResponse(service.save(RefreshTokenMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public RefreshTokenResponse getById(@PathVariable Long id) {
        return RefreshTokenMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<RefreshTokenResponse> list() {
        return service.findAll().stream().map(RefreshTokenMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public RefreshTokenResponse update(@PathVariable Long id, @RequestBody RefreshTokenRequest request) {
        var entity = service.getById(id);
        RefreshTokenMapper.applyTo(entity, request);
        return RefreshTokenMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
