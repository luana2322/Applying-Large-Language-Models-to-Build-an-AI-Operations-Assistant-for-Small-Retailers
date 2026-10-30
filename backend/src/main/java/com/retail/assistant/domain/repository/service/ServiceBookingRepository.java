package com.retail.assistant.domain.repository.service;

import com.retail.assistant.domain.entity.service.ServiceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    Optional<ServiceBooking> findByBookingCode(String bookingCode);
    List<ServiceBooking> findByCustomerId(Long customerId);
    List<ServiceBooking> findByPetId(Long petId);
    List<ServiceBooking> findByBookingDate(LocalDate date);
    List<ServiceBooking> findByStatus(String status);
}
