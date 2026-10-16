package com.retail.assistant.domain.service.system;

import com.retail.assistant.domain.entity.system.RefreshToken;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken save(RefreshToken entity);
    RefreshToken getById(Long id);
    Optional<RefreshToken> findById(Long id);
    List<RefreshToken> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<RefreshToken> findByUserId(Long id);
}
