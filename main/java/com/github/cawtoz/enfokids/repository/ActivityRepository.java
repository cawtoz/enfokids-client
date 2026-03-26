package com.github.cawtoz.enfokids.repository;

import org.springframework.stereotype.Repository;
import com.github.cawtoz.enfokids.model.activity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
}
