package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.TherapistRequest;
import com.github.cawtoz.enfokids.dto.request.TherapistUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.TherapistResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.user.types.Therapist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface TherapistMapper extends GenericMapper<Therapist, TherapistRequest, TherapistUpdateRequest, TherapistResponse> {
    
    @Override
    @Mapping(target = "roles", qualifiedByName = "rolesToRoleEnums")
    TherapistResponse toResponse(Therapist entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "children", ignore = true)
    Therapist toEntity(TherapistRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "children", ignore = true)
    void updateEntityFromRequest(TherapistRequest request, @MappingTarget Therapist entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "children", ignore = true)
    void updateEntityFromUpdateRequest(TherapistUpdateRequest request, @MappingTarget Therapist entity);
}
