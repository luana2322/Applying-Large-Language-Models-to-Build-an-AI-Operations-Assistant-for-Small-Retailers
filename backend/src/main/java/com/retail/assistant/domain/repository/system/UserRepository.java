package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRoleId(Long id);
}
