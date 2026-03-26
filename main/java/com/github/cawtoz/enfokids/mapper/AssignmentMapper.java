package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.AssignmentRequest;
import com.github.cawtoz.enfokids.dto.request.AssignmentUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.AssignmentResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.activity.Assignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AssignmentMapper extends GenericMapper<Assignment, AssignmentRequest, AssignmentUpdateRequest, AssignmentResponse> {
    
    @Override
    @Mapping(target = "therapistId", source = "therapist.id")
    @Mapping(target = "therapistName", source = "therapist.firstName")
    @Mapping(target = "childId", source = "child.id")
    @Mapping(target = "childName", source = "child.firstName")
    @Mapping(target = "activityId", source = "activity.id")
    @Mapping(target = "activityTitle", source = "activity.title")
    AssignmentResponse toResponse(Assignment entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "child", ignore = true)
    @Mapping(target = "activity", ignore = true)
    Assignment toEntity(AssignmentRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "child", ignore = true)
    @Mapping(target = "activity", ignore = true)
    void updateEntityFromRequest(AssignmentRequest request, @MappingTarget Assignment entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "child", ignore = true)
    @Mapping(target = "activity", ignore = true)
    void updateEntityFromUpdateRequest(AssignmentUpdateRequest request, @MappingTarget Assignment entity);
}
