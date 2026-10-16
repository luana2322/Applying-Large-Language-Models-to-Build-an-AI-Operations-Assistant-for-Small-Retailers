package com.retail.assistant.domain.repository.catalog;

import com.retail.assistant.domain.entity.catalog.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentId(Long id);
}
