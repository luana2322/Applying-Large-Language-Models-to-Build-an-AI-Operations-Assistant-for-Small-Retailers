package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.AlertSetting;
import java.util.List;
import java.util.Optional;

public interface AlertSettingService {
    AlertSetting save(AlertSetting entity);
    AlertSetting getById(Long id);
    Optional<AlertSetting> findById(Long id);
    List<AlertSetting> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<AlertSetting> findByOwnerId(Long id);
}
