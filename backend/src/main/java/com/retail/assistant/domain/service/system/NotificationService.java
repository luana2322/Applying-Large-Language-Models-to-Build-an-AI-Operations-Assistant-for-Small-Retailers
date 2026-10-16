package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.Notification;
import java.util.List;
import java.util.Optional;

public interface NotificationService {
    Notification save(Notification entity);
    Notification getById(Long id);
    Optional<Notification> findById(Long id);
    List<Notification> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<Notification> findByUserId(Long id);
}
