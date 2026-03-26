package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.ProgressRequest;
import com.github.cawtoz.enfokids.dto.request.ProgressUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ProgressResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.activity.Progress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProgressMapper extends GenericMapper<Progress, ProgressRequest, ProgressUpdateRequest, ProgressResponse> {
    
    @Override
    @Mapping(target = "assignmentId", source = "assignment.id")
    ProgressResponse toResponse(Progress entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "assignment", ignore = true)
    Progress toEntity(ProgressRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "assignment", ignore = true)
    void updateEntityFromRequest(ProgressRequest request, @MappingTarget Progress entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "assignment", ignore = true)
    void updateEntityFromUpdateRequest(ProgressUpdateRequest request, @MappingTarget Progress entity);
}
