package com.retail.assistant.domain.service.audit;

import com.retail.assistant.domain.entity.audit.AuditLog;
import java.util.List;
import java.util.Optional;

public interface AuditLogService {
    AuditLog save(AuditLog entity);
    AuditLog getById(Long id);
    Optional<AuditLog> findById(Long id);
    List<AuditLog> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<AuditLog> findByChangedById(Long id);
}
