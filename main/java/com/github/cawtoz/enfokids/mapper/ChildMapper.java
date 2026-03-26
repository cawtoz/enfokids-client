package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.ChildRequest;
import com.github.cawtoz.enfokids.dto.request.ChildUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ChildResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.user.types.Child;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {UserMapper.class, TherapistMapper.class})
public interface ChildMapper extends GenericMapper<Child, ChildRequest, ChildUpdateRequest, ChildResponse> {
    
    @Override
    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToRoleEnums")
    @Mapping(target = "therapist", source = "therapist")
    ChildResponse toResponse(Child entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "caregiverChildren", ignore = true)
    Child toEntity(ChildRequest request);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "caregiverChildren", ignore = true)
    void updateEntityFromRequest(ChildRequest request, @MappingTarget Child entity);
    
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "therapist", ignore = true)
    @Mapping(target = "caregiverChildren", ignore = true)
    void updateEntityFromUpdateRequest(ChildUpdateRequest request, @MappingTarget Child entity);
}
