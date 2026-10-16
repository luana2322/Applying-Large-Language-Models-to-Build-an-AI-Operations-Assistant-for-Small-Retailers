package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.StoreProfileService;
import com.retail.assistant.dto.system.StoreProfileMapper;
import com.retail.assistant.dto.system.StoreProfileRequest;
import com.retail.assistant.dto.system.StoreProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/store-profile")
public class StoreProfileController {

    private final StoreProfileService service;

    public StoreProfileController(StoreProfileService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StoreProfileResponse> create(@RequestBody StoreProfileRequest request) {
        StoreProfileResponse body = StoreProfileMapper.toResponse(service.save(StoreProfileMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StoreProfileResponse getById(@PathVariable Long id) {
        return StoreProfileMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StoreProfileResponse> list() {
        return service.findAll().stream().map(StoreProfileMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StoreProfileResponse update(@PathVariable Long id, @RequestBody StoreProfileRequest request) {
        var entity = service.getById(id);
        StoreProfileMapper.applyTo(entity, request);
        return StoreProfileMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
