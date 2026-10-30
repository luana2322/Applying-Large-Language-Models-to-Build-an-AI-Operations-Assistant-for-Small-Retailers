package com.retail.assistant.controller.service;

import com.retail.assistant.domain.service.service.GroomingService;
import com.retail.assistant.dto.service.ServiceBookingDto;
import com.retail.assistant.dto.service.ServiceDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final GroomingService groomingService;

    public ServiceController(GroomingService groomingService) {
        this.groomingService = groomingService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        return ResponseEntity.ok(groomingService.getAllServices());
    }

    @PostMapping
    public ResponseEntity<ServiceDto> createService(@RequestBody ServiceDto dto) {
        return ResponseEntity.ok(groomingService.createService(dto));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<ServiceBookingDto>> getAllBookings() {
        return ResponseEntity.ok(groomingService.getAllBookings());
    }

    @PostMapping("/bookings")
    public ResponseEntity<ServiceBookingDto> createBooking(@RequestBody ServiceBookingDto dto) {
        return ResponseEntity.ok(groomingService.createBooking(dto));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ServiceBookingDto> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(groomingService.updateBookingStatus(id, status));
    }
}
