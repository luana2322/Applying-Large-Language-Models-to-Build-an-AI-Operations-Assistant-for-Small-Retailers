package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.system.UserTableColumnSettingService;
import com.retail.assistant.dto.system.UserTableColumnSettingMapper;
import com.retail.assistant.dto.system.UserTableColumnSettingRequest;
import com.retail.assistant.dto.system.UserTableColumnSettingResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/user-table-column-setting")
public class UserTableColumnSettingController {

    private final UserTableColumnSettingService service;

    public UserTableColumnSettingController(UserTableColumnSettingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UserTableColumnSettingResponse> create(@RequestBody UserTableColumnSettingRequest request) {
        UserTableColumnSettingResponse body = UserTableColumnSettingMapper.toResponse(service.save(UserTableColumnSettingMapper.toEntity(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{id}")
    public UserTableColumnSettingResponse getById(@PathVariable Long id) {
        return UserTableColumnSettingMapper.toResponse(service.getById(id));
    }

    @GetMapping
    public List<UserTableColumnSettingResponse> list() {
        return service.findAll().stream().map(UserTableColumnSettingMapper::toResponse).toList();
    }

    @PutMapping("/{id}")
    public UserTableColumnSettingResponse update(@PathVariable Long id, @RequestBody UserTableColumnSettingRequest request) {
        var entity = service.getById(id);
        UserTableColumnSettingMapper.applyTo(entity, request);
        return UserTableColumnSettingMapper.toResponse(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
