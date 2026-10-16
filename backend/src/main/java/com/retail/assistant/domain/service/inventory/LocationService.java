package com.retail.assistant.domain.service.inventory;

import com.retail.assistant.domain.entity.inventory.Location;
import java.util.List;
import java.util.Optional;

public interface LocationService {
    Location save(Location entity);
    Location getById(Long id);
    Optional<Location> findById(Long id);
    List<Location> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
