package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.UserRequest;
import com.github.cawtoz.enfokids.dto.request.UserUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.UserResponse;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.UserMapper;
import com.github.cawtoz.enfokids.model.role.Role;
import com.github.cawtoz.enfokids.model.user.User;
import com.github.cawtoz.enfokids.repository.RoleRepository;
import com.github.cawtoz.enfokids.repository.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService extends GenericService<User, Long, UserRequest, UserUpdateRequest, UserResponse, UserMapper> {

    @Autowired
    protected UserRepository repository;

    @Autowired
    private RoleRepository roleRepository;

    public Optional<UserResponse> findByEmail(String email) {
        return repository.findByEmail(email).map(mapper::toResponse);
    }

    @Override
    public UserResponse create(UserRequest request) {
        User user = mapper.toEntity(request);
        setRolesFromIds(user, request.getRoleIds());
        User saved = repository.save(user);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<UserResponse> update(Long id, UserUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    if (request.getUsername() != null && 
                        !request.getUsername().equals(existing.getUsername()) &&
                        repository.existsByUsername(request.getUsername())) {
                        throw new IllegalArgumentException("username: El nombre de usuario ya existe");
                    }
                    
                    if (request.getEmail() != null && 
                        !request.getEmail().equals(existing.getEmail()) &&
                        repository.existsByEmail(request.getEmail())) {
                        throw new IllegalArgumentException("email: El email ya existe");
                    }
                    
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    setRolesFromIds(existing, request.getRoleIds());
                    User updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }

    public void setRolesFromIds(User user, Set<Long> roleIds) {
        if (roleIds != null && !roleIds.isEmpty()) {
            Set<Role> roles = new HashSet<>();

            List<Long> notFoundRoleIds = roleIds.stream()
                    .filter(roleId -> {
                        Optional<Role> roleOpt = roleRepository.findById(roleId);
                        if (roleOpt.isPresent()) {
                            roles.add(roleOpt.get());
                            return false;
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
            
            if (!notFoundRoleIds.isEmpty()) {
                throw new ResourceNotFoundException("Roles no encontrados con IDs: " + notFoundRoleIds);
            }
            
            user.setRoles(roles);
        }
    }

}