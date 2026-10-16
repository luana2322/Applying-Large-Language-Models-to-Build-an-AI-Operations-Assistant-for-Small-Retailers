package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.StaffPasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StaffPasswordResetRequestRepository extends JpaRepository<StaffPasswordResetRequest, Long> {
    List<StaffPasswordResetRequest> findByUserId(Long id);
    List<StaffPasswordResetRequest> findByProcessedById(Long id);
}
