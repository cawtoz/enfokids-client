package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.ActivityPlanRequest;
import com.github.cawtoz.enfokids.dto.request.ActivityPlanUpdateRequest;
import com.github.cawtoz.enfokids.dto.request.PlanDetailRequest;
import com.github.cawtoz.enfokids.dto.response.ActivityPlanResponse;
import com.github.cawtoz.enfokids.dto.response.PlanDetailResponse;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.ActivityPlanMapper;
import com.github.cawtoz.enfokids.mapper.PlanDetailMapper;
import com.github.cawtoz.enfokids.model.activity.ActivityPlan;
import com.github.cawtoz.enfokids.repository.TherapistRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ActivityPlanService extends GenericService<ActivityPlan, Long, ActivityPlanRequest, ActivityPlanUpdateRequest, ActivityPlanResponse, ActivityPlanMapper> {
    
    @Autowired
    private TherapistRepository therapistRepository;
    
    @Autowired
    private PlanDetailService planDetailService;
    
    @Autowired
    private PlanDetailMapper planDetailMapper;
    
    @Override
    public ActivityPlanResponse create(ActivityPlanRequest request) {
        ActivityPlan activityPlan = mapper.toEntity(request);
        setTherapistFromId(activityPlan, request.getTherapistId());
        ActivityPlan saved = repository.save(activityPlan);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<ActivityPlanResponse> update(Long id, ActivityPlanUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    setTherapistFromId(existing, request.getTherapistId());
                    ActivityPlan updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
    private void setTherapistFromId(ActivityPlan activityPlan, Long therapistId) {
        if (therapistId != null) {
            activityPlan.setTherapist(
                therapistRepository.findById(therapistId)
                    .orElseThrow(() -> new ResourceNotFoundException("Terapeuta", "id", therapistId))
            );
        }
    }
                
    public PlanDetailResponse addActivityToPlan(Long planId, PlanDetailRequest request) {
        repository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan de actividad", "id", planId));
        
        request.setPlanId(planId);
        return planDetailService.create(request);
    }
    
    public List<PlanDetailResponse> addActivitiesToPlan(Long planId, List<PlanDetailRequest> requests) {
        repository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan de actividad", "id", planId));
        
        return requests.stream()
            .map(request -> {
                request.setPlanId(planId);
                return planDetailService.create(request);
            })
            .collect(Collectors.toList());
    }
    
    public List<PlanDetailResponse> getActivitiesFromPlan(Long planId) {
        ActivityPlan plan = repository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan de actividad", "id", planId));
        
        return planDetailMapper.toResponseSet(plan.getDetails());
    }
    
    public void removeActivityFromPlan(Long planId, Long detailId) {
        repository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan de actividad", "id", planId));
        
        planDetailService.findById(detailId)
            .orElseThrow(() -> new ResourceNotFoundException("Detalle del plan", "id", detailId));
        
        planDetailService.deleteById(detailId);
    }
    
    public void removeAllActivitiesFromPlan(Long planId) {
        ActivityPlan plan = repository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan de actividad", "id", planId));
        
        plan.getDetails().clear();
        repository.save(plan);
    }
    
}