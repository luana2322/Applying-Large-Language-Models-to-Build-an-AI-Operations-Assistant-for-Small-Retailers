package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User save(User entity);
    User getById(Long id);
    Optional<User> findById(Long id);
    List<User> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<User> findByRoleId(Long id);
}
