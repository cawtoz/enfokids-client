package com.github.cawtoz.enfokids.mapper;

import com.github.cawtoz.enfokids.dto.request.RoleRequest;
import com.github.cawtoz.enfokids.dto.request.RoleUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.RoleResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.role.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper extends GenericMapper<Role, RoleRequest, RoleUpdateRequest, RoleResponse> {
    
}