package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
