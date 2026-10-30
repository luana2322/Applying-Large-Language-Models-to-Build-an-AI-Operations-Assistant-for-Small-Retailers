package com.retail.assistant.controller.pet;

import com.retail.assistant.domain.service.pet.PetService;
import com.retail.assistant.dto.pet.PetDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public ResponseEntity<List<PetDto>> getAllPets() {
        return ResponseEntity.ok(petService.getAllActivePets());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PetDto>> getPetsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(petService.getPetsByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDto> getPetById(@PathVariable Long id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    @PostMapping
    public ResponseEntity<PetDto> createPet(@RequestBody PetDto dto) {
        return ResponseEntity.ok(petService.createPet(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDto> updatePet(@PathVariable Long id, @RequestBody PetDto dto) {
        return ResponseEntity.ok(petService.updatePet(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }
}
