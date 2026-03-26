package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.ActivityPlanRequest;
import com.github.cawtoz.enfokids.dto.request.ActivityPlanUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ActivityPlanResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.activity.ActivityPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ActivityPlanMapper extends GenericMapper<ActivityPlan, ActivityPlanRequest, ActivityPlanUpdateRequest, ActivityPlanResponse> {

    @Override
    @Mapping(target = "therapistId", source = "therapist.id")
    @Mapping(target = "therapistName", source = "therapist.firstName")
    ActivityPlanResponse toResponse(ActivityPlan entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "details", ignore = true)
    ActivityPlan toEntity(ActivityPlanRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "details", ignore = true)
    void updateEntityFromRequest(ActivityPlanRequest request, @MappingTarget ActivityPlan entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "details", ignore = true)
    void updateEntityFromUpdateRequest(ActivityPlanUpdateRequest request, @MappingTarget ActivityPlan entity);
}
