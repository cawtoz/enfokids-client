package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.activity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.github.cawtoz.enfokids.model.activity.enums.AssignmentStatusEnum;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByChildId(Long childId);
    List<Assignment> findByStatus(AssignmentStatusEnum status);
    List<Assignment> findByChildIdAndStatus(Long childId, AssignmentStatusEnum status);
}
