package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.activity.PlanDetail;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface PlanDetailRepository extends JpaRepository<PlanDetail, Long> {
}
