package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.StoreProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoreProfileRepository extends JpaRepository<StoreProfile, Long> {
    List<StoreProfile> findByOwnerId(Long id);
}
