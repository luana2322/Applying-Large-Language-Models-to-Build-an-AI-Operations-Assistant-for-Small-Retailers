package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.SystemLog;
import java.util.List;
import java.util.Optional;

public interface SystemLogService {
    SystemLog save(SystemLog entity);
    SystemLog getById(Long id);
    Optional<SystemLog> findById(Long id);
    List<SystemLog> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<SystemLog> findByUserId(Long id);
}
