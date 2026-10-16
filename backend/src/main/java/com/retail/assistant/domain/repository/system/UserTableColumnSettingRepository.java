package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.UserTableColumnSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserTableColumnSettingRepository extends JpaRepository<UserTableColumnSetting, Long> {
    List<UserTableColumnSetting> findByUserId(Long id);
}
