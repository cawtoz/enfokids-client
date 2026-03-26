package com.github.cawtoz.enfokids.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.github.cawtoz.enfokids.dto.request.ActivityPlanRequest;
import com.github.cawtoz.enfokids.dto.request.ActivityPlanUpdateRequest;
import com.github.cawtoz.enfokids.dto.request.PlanDetailRequest;
import com.github.cawtoz.enfokids.dto.response.ActivityPlanResponse;
import com.github.cawtoz.enfokids.dto.response.PlanDetailResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.ActivityPlanService;

import java.util.List;

@RestController
@RequestMapping("/api/activity-plans")
public class ActivityPlanController extends GenericController<Long, ActivityPlanRequest, ActivityPlanUpdateRequest, ActivityPlanResponse, ActivityPlanService> {
    
    @PostMapping("/{planId}/activities")
    public ResponseEntity<PlanDetailResponse> addActivity(
        @PathVariable Long planId,
        @Valid @RequestBody PlanDetailRequest request
    ) {
        PlanDetailResponse response = service.addActivityToPlan(planId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/{planId}/activities/batch")
    public ResponseEntity<List<PlanDetailResponse>> addActivities(
        @PathVariable Long planId,
        @Valid @RequestBody List<PlanDetailRequest> requests
    ) {
        List<PlanDetailResponse> responses = service.addActivitiesToPlan(planId, requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }
    
    @GetMapping("/{planId}/activities")
    public ResponseEntity<List<PlanDetailResponse>> getActivities(@PathVariable Long planId) {
        List<PlanDetailResponse> activities = service.getActivitiesFromPlan(planId);
        return ResponseEntity.ok(activities);
    }
    
    @DeleteMapping("/{planId}/activities/{detailId}")
    public ResponseEntity<Void> removeActivity(
        @PathVariable Long planId,
        @PathVariable Long detailId
    ) {
        service.removeActivityFromPlan(planId, detailId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{planId}/activities")
    public ResponseEntity<Void> removeAllActivities(@PathVariable Long planId) {
        service.removeAllActivitiesFromPlan(planId);
        return ResponseEntity.noContent().build();
    }
    
}