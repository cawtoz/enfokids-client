package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.TherapistRequest;
import com.github.cawtoz.enfokids.dto.request.TherapistUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ChildResponse;
import com.github.cawtoz.enfokids.dto.response.TherapistResponse;
import com.github.cawtoz.enfokids.exception.ForbiddenException;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.ChildMapper;
import com.github.cawtoz.enfokids.mapper.TherapistMapper;
import com.github.cawtoz.enfokids.model.role.RoleEnum;
import com.github.cawtoz.enfokids.model.user.User;
import com.github.cawtoz.enfokids.model.user.types.Therapist;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TherapistService extends GenericService<Therapist, Long, TherapistRequest, TherapistUpdateRequest, TherapistResponse, TherapistMapper> {

    @Autowired
    private RoleService roleService;
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private ChildMapper childMapper;

    @Override
    public TherapistResponse create(TherapistRequest request) {
        Therapist therapist = mapper.toEntity(request);
        roleService.assignRoleToUser(therapist, RoleEnum.THERAPIST);
        Therapist saved = repository.save(therapist);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<TherapistResponse> update(Long id, TherapistUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    Therapist updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
    public List<ChildResponse> getChildrenByTherapistId(Long therapistId) {
        
        Therapist therapist = repository.findById(therapistId)
                .orElseThrow(() -> new ResourceNotFoundException("Therapist", "id", therapistId));
        
        return therapist.getChildren().stream()
                .map(childMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<ChildResponse> getMyChildren() {

        User currentUser = authService.getCurrentUserEntity();

        if (!currentUser.isTherapist()) {
            throw new ForbiddenException("Solo los terapeutas pueden acceder a sus propios niños");
        }

        Long therapistId = currentUser.getId();
        return getChildrenByTherapistId(therapistId);
    }

}