package com.retail.assistant.domain.entity.system;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_table_column_settings",
    uniqueConstraints = @UniqueConstraint(name = "uk_user_table_key", columnNames = {"user_id", "table_key"})
)
public class UserTableColumnSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "table_key", nullable = false, length = 80)
    private String tableKey;

    @Column(name = "hidden_columns", columnDefinition = "TEXT")
    private String hiddenColumns = "[]";

    @Column(name = "column_order", columnDefinition = "TEXT")
    private String columnOrder = "[]";

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public UserTableColumnSetting() {}

    public UserTableColumnSetting(User user, String tableKey) {
        this.user = user;
        this.tableKey = tableKey;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTableKey() { return tableKey; }
    public void setTableKey(String tableKey) { this.tableKey = tableKey; }
    public String getHiddenColumns() { return hiddenColumns; }
    public void setHiddenColumns(String hiddenColumns) { this.hiddenColumns = hiddenColumns; }
    public String getColumnOrder() { return columnOrder; }
    public void setColumnOrder(String columnOrder) { this.columnOrder = columnOrder; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
