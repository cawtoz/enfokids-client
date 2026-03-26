package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.activity.ActivityPlan;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ActivityPlanRepository extends JpaRepository<ActivityPlan, Long> {
}
