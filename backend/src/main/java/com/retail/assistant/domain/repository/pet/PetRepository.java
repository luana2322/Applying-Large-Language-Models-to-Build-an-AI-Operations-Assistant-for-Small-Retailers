package com.retail.assistant.domain.repository.pet;

import com.retail.assistant.domain.entity.pet.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByCustomerIdAndDeletedAtIsNull(Long customerId);
    List<Pet> findBySpeciesAndIsActiveTrue(String species);
    List<Pet> findByDeletedAtIsNull();
}
