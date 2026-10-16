package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.NotificationService;
import com.retail.assistant.dto.system.NotificationMapper;
import com.retail.assistant.dto.system.NotificationRequest;
import com.retail.assistant.dto.system.NotificationResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/notification")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> create(@RequestBody NotificationRequest request) {
        NotificationResponse body = NotificationMapper.toResponse(service.save(NotificationMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public NotificationResponse getById(@PathVariable Long id) {
        return NotificationMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<NotificationResponse> list() {
        return service.findAll().stream().map(NotificationMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public NotificationResponse update(@PathVariable Long id, @RequestBody NotificationRequest request) {
        var entity = service.getById(id);
        NotificationMapper.applyTo(entity, request);
        return NotificationMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
