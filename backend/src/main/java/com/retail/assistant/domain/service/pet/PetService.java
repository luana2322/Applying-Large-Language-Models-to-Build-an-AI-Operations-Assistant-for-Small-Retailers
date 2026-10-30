package com.retail.assistant.domain.service.pet;

import com.retail.assistant.domain.entity.pet.Pet;
import com.retail.assistant.domain.entity.sales.Customer;
import com.retail.assistant.domain.repository.pet.PetRepository;
import com.retail.assistant.domain.repository.sales.CustomerRepository;
import com.retail.assistant.dto.pet.PetDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PetService {

    private final PetRepository petRepository;
    private final CustomerRepository customerRepository;

    public PetService(PetRepository petRepository, CustomerRepository customerRepository) {
        this.petRepository = petRepository;
        this.customerRepository = customerRepository;
    }

    public List<PetDto> getPetsByCustomerId(Long customerId) {
        return petRepository.findByCustomerIdAndDeletedAtIsNull(customerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PetDto> getAllActivePets() {
        return petRepository.findByDeletedAtIsNull().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PetDto getPetById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thú cưng với ID: " + id));
        return toDto(pet);
    }

    public PetDto createPet(PetDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại: " + dto.getCustomerId()));

        Pet pet = new Pet(customer, dto.getName(), dto.getSpecies(), dto.getBreed(), dto.getGender());
        pet.setBirthDate(dto.getBirthDate());
        pet.setWeightKg(dto.getWeightKg());
        pet.setColor(dto.getColor());
        pet.setAllergies(dto.getAllergies());
        pet.setHealthNotes(dto.getHealthNotes());
        pet.setPhotoUrl(dto.getPhotoUrl());
        pet.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        return toDto(petRepository.save(pet));
    }

    public PetDto updatePet(Long id, PetDto dto) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thú cưng với ID: " + id));

        if (dto.getName() != null) pet.setName(dto.getName());
        if (dto.getSpecies() != null) pet.setSpecies(dto.getSpecies());
        if (dto.getBreed() != null) pet.setBreed(dto.getBreed());
        if (dto.getGender() != null) pet.setGender(dto.getGender());
        if (dto.getBirthDate() != null) pet.setBirthDate(dto.getBirthDate());
        if (dto.getWeightKg() != null) pet.setWeightKg(dto.getWeightKg());
        if (dto.getColor() != null) pet.setColor(dto.getColor());
        if (dto.getAllergies() != null) pet.setAllergies(dto.getAllergies());
        if (dto.getHealthNotes() != null) pet.setHealthNotes(dto.getHealthNotes());
        if (dto.getPhotoUrl() != null) pet.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getIsActive() != null) pet.setIsActive(dto.getIsActive());
        pet.setUpdatedAt(LocalDateTime.now());

        return toDto(petRepository.save(pet));
    }

    public void deletePet(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thú cưng với ID: " + id));
        pet.setDeletedAt(LocalDateTime.now());
        pet.setIsActive(false);
        petRepository.save(pet);
    }

    private PetDto toDto(Pet pet) {
        PetDto dto = new PetDto();
        dto.setId(pet.getId());
        dto.setCustomerId(pet.getCustomer() != null ? pet.getCustomer().getId() : null);
        dto.setCustomerName(pet.getCustomer() != null ? pet.getCustomer().getName() : null);
        dto.setName(pet.getName());
        dto.setSpecies(pet.getSpecies());
        dto.setBreed(pet.getBreed());
        dto.setGender(pet.getGender());
        dto.setBirthDate(pet.getBirthDate());
        dto.setWeightKg(pet.getWeightKg());
        dto.setColor(pet.getColor());
        dto.setAllergies(pet.getAllergies());
        dto.setHealthNotes(pet.getHealthNotes());
        dto.setPhotoUrl(pet.getPhotoUrl());
        dto.setIsActive(pet.getIsActive());
        return dto;
    }
}
