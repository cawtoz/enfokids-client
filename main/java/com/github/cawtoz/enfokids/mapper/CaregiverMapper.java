package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.CaregiverRequest;
import com.github.cawtoz.enfokids.dto.request.CaregiverUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.CaregiverResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.user.types.Caregiver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface CaregiverMapper extends GenericMapper<Caregiver, CaregiverRequest, CaregiverUpdateRequest, CaregiverResponse> {
    
    @Override
    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToRoleEnums")
    CaregiverResponse toResponse(Caregiver entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    Caregiver toEntity(CaregiverRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    void updateEntityFromRequest(CaregiverRequest request, @MappingTarget Caregiver entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    void updateEntityFromUpdateRequest(CaregiverUpdateRequest request, @MappingTarget Caregiver entity);
}
