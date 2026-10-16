package com.retail.assistant.domain.repository.audit;

import com.retail.assistant.domain.entity.audit.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByChangedById(Long id);
}
