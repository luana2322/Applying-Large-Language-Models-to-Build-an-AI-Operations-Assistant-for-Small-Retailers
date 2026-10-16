package com.retail.assistant.domain.repository.system;

import com.retail.assistant.domain.entity.system.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findByUserId(Long id);
}
