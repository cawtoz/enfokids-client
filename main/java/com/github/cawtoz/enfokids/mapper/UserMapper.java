package com.github.cawtoz.enfokids.mapper;
import com.github.cawtoz.enfokids.dto.request.UserRequest;
import com.github.cawtoz.enfokids.dto.request.UserUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.UserResponse;
import com.github.cawtoz.enfokids.generic.GenericMapper;
import com.github.cawtoz.enfokids.model.role.Role;
import com.github.cawtoz.enfokids.model.role.RoleEnum;
import com.github.cawtoz.enfokids.model.user.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper extends GenericMapper<User, UserRequest, UserUpdateRequest, UserResponse> {

    @Override
    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToRoleEnums")
    UserResponse toResponse(User entity);

    @Override
    default List<UserResponse> toResponseSet(List<User> entities) {
        return entities == null ? null : entities.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toEntity(UserRequest request);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UserRequest request, @MappingTarget User entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromUpdateRequest(UserUpdateRequest request, @MappingTarget User entity);
    
    @Named("rolesToRoleEnums")
    default Set<RoleEnum> rolesToRoleEnums(Set<Role> roles) {
        return roles == null ? null : roles.stream().map(Role::getName).collect(Collectors.toSet());
    }
}
