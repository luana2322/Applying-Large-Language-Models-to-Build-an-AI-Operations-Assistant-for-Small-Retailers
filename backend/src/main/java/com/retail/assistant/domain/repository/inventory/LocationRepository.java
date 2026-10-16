package com.retail.assistant.domain.repository.inventory;

import com.retail.assistant.domain.entity.inventory.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
