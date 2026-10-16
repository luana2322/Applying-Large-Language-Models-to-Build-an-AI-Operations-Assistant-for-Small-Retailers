package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.AlertSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertSettingRepository extends JpaRepository<AlertSetting, Long> {
    List<AlertSetting> findByOwnerId(Long id);
}
