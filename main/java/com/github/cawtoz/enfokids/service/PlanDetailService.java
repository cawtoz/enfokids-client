package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.PlanDetailRequest;
import com.github.cawtoz.enfokids.dto.request.PlanDetailUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.PlanDetailResponse;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.PlanDetailMapper;
import com.github.cawtoz.enfokids.model.activity.PlanDetail;
import com.github.cawtoz.enfokids.repository.ActivityPlanRepository;
import com.github.cawtoz.enfokids.repository.ActivityRepository;

import java.util.Optional;

@Service
public class PlanDetailService extends GenericService<PlanDetail, Long, PlanDetailRequest, PlanDetailUpdateRequest, PlanDetailResponse, PlanDetailMapper> {
    
    @Autowired
    private ActivityPlanRepository activityPlanRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Override
    public PlanDetailResponse create(PlanDetailRequest request) {
        PlanDetail planDetail = mapper.toEntity(request);
        setRelationsFromIds(planDetail, request.getPlanId(), request.getActivityId());
        PlanDetail saved = repository.save(planDetail);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<PlanDetailResponse> update(Long id, PlanDetailUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    setRelationsFromIds(existing, request.getPlanId(), request.getActivityId());
                    PlanDetail updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
    private void setRelationsFromIds(PlanDetail planDetail, Long planId, Long activityId) {
        if (planId != null) {
            planDetail.setPlan(
                activityPlanRepository.findById(planId)
                    .orElseThrow(() -> new ResourceNotFoundException("Plan de actividad", "id", planId))
            );
        }
        if (activityId != null) {
            planDetail.setActivity(
                activityRepository.findById(activityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Actividad", "id", activityId))
            );
        }
    }
    
}