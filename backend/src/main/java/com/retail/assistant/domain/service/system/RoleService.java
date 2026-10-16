package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.Role;
import java.util.List;
import java.util.Optional;

public interface RoleService {
    Role save(Role entity);
    Role getById(Long id);
    Optional<Role> findById(Long id);
    List<Role> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
