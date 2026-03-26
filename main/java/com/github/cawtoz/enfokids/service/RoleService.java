package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.RoleRequest;
import com.github.cawtoz.enfokids.dto.request.RoleUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.RoleResponse;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.RoleMapper;
import com.github.cawtoz.enfokids.model.role.Role;
import com.github.cawtoz.enfokids.model.role.RoleEnum;
import com.github.cawtoz.enfokids.model.user.User;
import com.github.cawtoz.enfokids.repository.RoleRepository;

import java.util.Set;

@Service
public class RoleService extends GenericService<Role, Long, RoleRequest, RoleUpdateRequest, RoleResponse, RoleMapper> {
    
    @Autowired
    protected RoleRepository repository;

    public void assignRoleToUser(User user, RoleEnum roleEnum) {
        repository.findByName(roleEnum).ifPresent(role -> user.setRoles(Set.of(role)));
    }
    
}