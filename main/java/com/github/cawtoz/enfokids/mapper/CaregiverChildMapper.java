package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.CaregiverChildRequest;
import com.github.cawtoz.enfokids.dto.request.CaregiverChildUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.CaregiverChildResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.relation.CaregiverChild;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CaregiverChildMapper extends GenericMapper<CaregiverChild, CaregiverChildRequest, CaregiverChildUpdateRequest, CaregiverChildResponse> {
    
    @Override
    @Mapping(target = "caregiverId", source = "caregiver.id")
    @Mapping(target = "caregiverName", source = "caregiver.firstName")
    @Mapping(target = "childId", source = "child.id")
    @Mapping(target = "childName", source = "child.firstName")
    CaregiverChildResponse toResponse(CaregiverChild entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "caregiver", ignore = true)
    @Mapping(target = "child", ignore = true)
    CaregiverChild toEntity(CaregiverChildRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "caregiver", ignore = true)
    @Mapping(target = "child", ignore = true)
    void updateEntityFromRequest(CaregiverChildRequest request, @MappingTarget CaregiverChild entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "caregiver", ignore = true)
    @Mapping(target = "child", ignore = true)
    void updateEntityFromUpdateRequest(CaregiverChildUpdateRequest request, @MappingTarget CaregiverChild entity);
}
