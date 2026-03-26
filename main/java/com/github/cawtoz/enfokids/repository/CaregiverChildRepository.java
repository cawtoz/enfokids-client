package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.relation.CaregiverChild;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@Repository
public interface CaregiverChildRepository extends JpaRepository<CaregiverChild, Long> {
    List<CaregiverChild> findByCaregiverId(Long caregiverId);
    List<CaregiverChild> findByChildId(Long childId);
}
