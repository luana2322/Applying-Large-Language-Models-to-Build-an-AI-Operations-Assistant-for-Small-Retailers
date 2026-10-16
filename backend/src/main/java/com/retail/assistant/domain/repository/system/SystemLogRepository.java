package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findByUserId(Long id);
}
