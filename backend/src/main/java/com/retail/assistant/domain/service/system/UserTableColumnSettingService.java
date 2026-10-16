package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.UserTableColumnSetting;
import java.util.List;
import java.util.Optional;

public interface UserTableColumnSettingService {
    UserTableColumnSetting save(UserTableColumnSetting entity);
    UserTableColumnSetting getById(Long id);
    Optional<UserTableColumnSetting> findById(Long id);
    List<UserTableColumnSetting> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<UserTableColumnSetting> findByUserId(Long id);
}
