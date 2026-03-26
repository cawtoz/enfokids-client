package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.activity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByAssignmentId(Long assignmentId);
}
