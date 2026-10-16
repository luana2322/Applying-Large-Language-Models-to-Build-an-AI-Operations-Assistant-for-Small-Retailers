package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.StaffPasswordResetRequest;
import java.util.List;
import java.util.Optional;

public interface StaffPasswordResetRequestService {
    StaffPasswordResetRequest save(StaffPasswordResetRequest entity);
    StaffPasswordResetRequest getById(Long id);
    Optional<StaffPasswordResetRequest> findById(Long id);
    List<StaffPasswordResetRequest> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<StaffPasswordResetRequest> findByUserId(Long id);
    List<StaffPasswordResetRequest> findByProcessedById(Long id);
}
