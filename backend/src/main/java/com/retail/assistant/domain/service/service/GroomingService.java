package com.retail.assistant.domain.service.service;

import com.retail.assistant.domain.entity.pet.Pet;
import com.retail.assistant.domain.entity.sales.Customer;
import com.retail.assistant.domain.entity.service.Service;
import com.retail.assistant.domain.entity.service.ServiceBooking;
import com.retail.assistant.domain.entity.service.ServiceBookingItem;
import com.retail.assistant.domain.entity.system.User;
import com.retail.assistant.domain.repository.pet.PetRepository;
import com.retail.assistant.domain.repository.sales.CustomerRepository;
import com.retail.assistant.domain.repository.service.ServiceBookingRepository;
import com.retail.assistant.domain.repository.service.ServiceRepository;
import com.retail.assistant.domain.repository.system.UserRepository;
import com.retail.assistant.dto.service.ServiceBookingDto;
import com.retail.assistant.dto.service.ServiceDto;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@Transactional
public class GroomingService {

    private final ServiceRepository serviceRepository;
    private final ServiceBookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public GroomingService(ServiceRepository serviceRepository,
                           ServiceBookingRepository bookingRepository,
                           CustomerRepository customerRepository,
                           PetRepository petRepository,
                           UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    public List<ServiceDto> getAllServices() {
        return serviceRepository.findByIsActiveTrue().stream()
                .map(this::toServiceDto)
                .collect(Collectors.toList());
    }

    public ServiceDto createService(ServiceDto dto) {
        Service service = new Service(
                dto.getServiceCode() != null ? dto.getServiceCode() : "SV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                dto.getName(),
                dto.getCategory(),
                dto.getDurationMinutes(),
                dto.getBasePrice(),
                dto.getPetType()
        );
        service.setDescription(dto.getDescription());
        return toServiceDto(serviceRepository.save(service));
    }

    public List<ServiceBookingDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toBookingDto)
                .collect(Collectors.toList());
    }

    public ServiceBookingDto createBooking(ServiceBookingDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại: " + dto.getCustomerId()));
        Pet pet = petRepository.findById(dto.getPetId())
                .orElseThrow(() -> new IllegalArgumentException("Thú cưng không tồn tại: " + dto.getPetId()));

        User staff = null;
        if (dto.getStaffId() != null) {
            staff = userRepository.findById(dto.getStaffId()).orElse(null);
        }

        ServiceBooking booking = new ServiceBooking();
        booking.setBookingCode(dto.getBookingCode() != null ? dto.getBookingCode() : "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setCustomer(customer);
        booking.setPet(pet);
        booking.setStaff(staff);
        booking.setBookingDate(dto.getBookingDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setStatus("PENDING");
        booking.setNotes(dto.getNotes());

        BigDecimal total = BigDecimal.ZERO;
        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            for (Long sId : dto.getServiceIds()) {
                Service s = serviceRepository.findById(sId)
                        .orElseThrow(() -> new IllegalArgumentException("Dịch vụ không tồn tại: " + sId));
                ServiceBookingItem item = new ServiceBookingItem(booking, s, s.getBasePrice(), 1);
                booking.getItems().add(item);
                total = total.add(s.getBasePrice());
            }
        }
        booking.setTotalAmount(total);

        return toBookingDto(bookingRepository.save(booking));
    }

    public ServiceBookingDto updateBookingStatus(Long bookingId, String status) {
        ServiceBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại: " + bookingId));
        booking.setStatus(status);
        if ("COMPLETED".equalsIgnoreCase(status)) {
            booking.setCompletedAt(LocalDateTime.now());
        }
        booking.setUpdatedAt(LocalDateTime.now());
        return toBookingDto(bookingRepository.save(booking));
    }

    private ServiceDto toServiceDto(Service s) {
        ServiceDto dto = new ServiceDto();
        dto.setId(s.getId());
        dto.setServiceCode(s.getServiceCode());
        dto.setName(s.getName());
        dto.setCategory(s.getCategory());
        dto.setDescription(s.getDescription());
        dto.setDurationMinutes(s.getDurationMinutes());
        dto.getBasePrice();
        dto.setBasePrice(s.getBasePrice());
        dto.setPetType(s.getPetType());
        dto.setIsActive(s.getIsActive());
        return dto;
    }

    private ServiceBookingDto toBookingDto(ServiceBooking b) {
        ServiceBookingDto dto = new ServiceBookingDto();
        dto.setId(b.getId());
        dto.setBookingCode(b.getBookingCode());
        dto.setCustomerId(b.getCustomer() != null ? b.getCustomer().getId() : null);
        dto.setCustomerName(b.getCustomer() != null ? b.getCustomer().getName() : null);
        dto.setPetId(b.getPet() != null ? b.getPet().getId() : null);
        dto.setPetName(b.getPet() != null ? b.getPet().getName() : null);
        dto.setStaffId(b.getStaff() != null ? b.getStaff().getId() : null);
        dto.setStaffName(b.getStaff() != null ? b.getStaff().getFullName() : null);
        dto.setBookingDate(b.getBookingDate());
        dto.setStartTime(b.getStartTime());
        dto.setEndTime(b.getEndTime());
        dto.setStatus(b.getStatus());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setNotes(b.getNotes());
        if (b.getItems() != null) {
            dto.setServiceIds(b.getItems().stream().map(i -> i.getService().getId()).collect(Collectors.toList()));
        }
        return dto;
    }
}
