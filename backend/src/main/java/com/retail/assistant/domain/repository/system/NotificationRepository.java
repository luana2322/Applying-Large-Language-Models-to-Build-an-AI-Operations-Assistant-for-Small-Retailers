package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long id);
}
