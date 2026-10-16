package com.retail.assistant.dto.system;

import com.retail.assistant.domain.entity.system.UserTableColumnSetting;
import com.retail.assistant.domain.entity.system.User;

public final class UserTableColumnSettingMapper {
    private UserTableColumnSettingMapper() {}

    public static UserTableColumnSetting toEntity(UserTableColumnSettingRequest r) {
        UserTableColumnSetting e = new UserTableColumnSetting();
        applyTo(e, r);
        return e;
    }

    public static void applyTo(UserTableColumnSetting e, UserTableColumnSettingRequest r) {
        if (r.userId() != null) {
            User ref = new User();
            ref.setId(r.userId());
            e.setUser(ref);
        }
        if (r.tableKey() != null) e.setTableKey(r.tableKey());
        if (r.hiddenColumns() != null) e.setHiddenColumns(r.hiddenColumns());
        if (r.columnOrder() != null) e.setColumnOrder(r.columnOrder());
        if (r.updatedBy() != null) e.setUpdatedBy(r.updatedBy());
        if (r.createdAt() != null) e.setCreatedAt(r.createdAt());
        if (r.updatedAt() != null) e.setUpdatedAt(r.updatedAt());
    }

    public static UserTableColumnSettingResponse toResponse(UserTableColumnSetting e) {
        if (e == null) return null;
        return new UserTableColumnSettingResponse(
            e.getId(),
            e.getUser() != null ? e.getUser().getId() : null,
            e.getTableKey(),
            e.getHiddenColumns(),
            e.getColumnOrder(),
            e.getUpdatedBy(),
            e.getCreatedAt(),
            e.getUpdatedAt()
        );
    }
}
