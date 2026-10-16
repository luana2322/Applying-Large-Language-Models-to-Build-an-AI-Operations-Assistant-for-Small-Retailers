package com.retail.assistant.controller.inventory;

import com.retail.assistant.domain.service.inventory.LocationService;
import com.retail.assistant.dto.inventory.LocationMapper;
import com.retail.assistant.dto.inventory.LocationRequest;
import com.retail.assistant.dto.inventory.LocationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/location")
public class LocationController {

    private final LocationService service;

    public LocationController(LocationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<LocationResponse> create(@RequestBody LocationRequest request) {
        LocationResponse body = LocationMapper.toResponse(service.save(LocationMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public LocationResponse getById(@PathVariable Long id) {
        return LocationMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<LocationResponse> list() {
        return service.findAll().stream().map(LocationMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public LocationResponse update(@PathVariable Long id, @RequestBody LocationRequest request) {
        var entity = service.getById(id);
        LocationMapper.applyTo(entity, request);
        return LocationMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
