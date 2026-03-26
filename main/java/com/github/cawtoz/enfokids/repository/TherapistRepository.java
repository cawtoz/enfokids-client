package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.user.types.Therapist;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface TherapistRepository extends JpaRepository<Therapist, Long> {
}
