package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.UserService;
import com.retail.assistant.dto.system.UserMapper;
import com.retail.assistant.dto.system.UserRequest;
import com.retail.assistant.dto.system.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/user")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@RequestBody UserRequest request) {
        UserResponse body = UserMapper.toResponse(service.save(UserMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return UserMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<UserResponse> list() {
        return service.findAll().stream().map(UserMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @RequestBody UserRequest request) {
        var entity = service.getById(id);
        UserMapper.applyTo(entity, request);
        return UserMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
