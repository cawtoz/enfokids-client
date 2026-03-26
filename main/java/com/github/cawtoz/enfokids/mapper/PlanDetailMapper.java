package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.PlanDetailRequest;
import com.github.cawtoz.enfokids.dto.request.PlanDetailUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.PlanDetailResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.activity.PlanDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PlanDetailMapper extends GenericMapper<PlanDetail, PlanDetailRequest, PlanDetailUpdateRequest, PlanDetailResponse> {
    
    @Override
    @Mapping(target = "planId", source = "plan.id")
    @Mapping(target = "planTitle", source = "plan.title")
    @Mapping(target = "activityId", source = "activity.id")
    @Mapping(target = "activityTitle", source = "activity.title")
    PlanDetailResponse toResponse(PlanDetail entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "plan", ignore = true)
    @Mapping(target = "activity", ignore = true)
    PlanDetail toEntity(PlanDetailRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "plan", ignore = true)
    @Mapping(target = "activity", ignore = true)
    void updateEntityFromRequest(PlanDetailRequest request, @MappingTarget PlanDetail entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "plan", ignore = true)
    @Mapping(target = "activity", ignore = true)
    void updateEntityFromUpdateRequest(PlanDetailUpdateRequest request, @MappingTarget PlanDetail entity);
}
