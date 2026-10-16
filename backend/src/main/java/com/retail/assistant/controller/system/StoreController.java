package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.StoreService;
import com.retail.assistant.dto.system.StoreMapper;
import com.retail.assistant.dto.system.StoreRequest;
import com.retail.assistant.dto.system.StoreResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/store")
public class StoreController {

    private final StoreService service;

    public StoreController(StoreService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StoreResponse> create(@RequestBody StoreRequest request) {
        StoreResponse body = StoreMapper.toResponse(service.save(StoreMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public StoreResponse getById(@PathVariable Long id) {
        return StoreMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<StoreResponse> list() {
        return service.findAll().stream().map(StoreMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public StoreResponse update(@PathVariable Long id, @RequestBody StoreRequest request) {
        var entity = service.getById(id);
        StoreMapper.applyTo(entity, request);
        return StoreMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
