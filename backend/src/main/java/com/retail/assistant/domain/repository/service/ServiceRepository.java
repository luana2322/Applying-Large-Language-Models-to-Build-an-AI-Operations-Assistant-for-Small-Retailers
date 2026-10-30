package com.retail.assistant.domain.repository.service;

import com.retail.assistant.domain.entity.service.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    Optional<Service> findByServiceCode(String serviceCode);
    List<Service> findByIsActiveTrue();
    List<Service> findByCategoryAndIsActiveTrue(String category);
}
