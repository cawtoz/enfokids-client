package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.CaregiverRequest;
import com.github.cawtoz.enfokids.dto.request.CaregiverUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.CaregiverResponse;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.CaregiverMapper;
import com.github.cawtoz.enfokids.model.role.RoleEnum;
import com.github.cawtoz.enfokids.model.user.types.Caregiver;

import java.util.Optional;

@Service
public class CaregiverService extends GenericService<Caregiver, Long, CaregiverRequest, CaregiverUpdateRequest, CaregiverResponse, CaregiverMapper> {

    @Autowired
    private RoleService roleService;

    @Override
    public CaregiverResponse create(CaregiverRequest request) {
        Caregiver caregiver = mapper.toEntity(request);
        roleService.assignRoleToUser(caregiver, RoleEnum.CAREGIVER);
        Caregiver saved = repository.save(caregiver);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<CaregiverResponse> update(Long id, CaregiverUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    Caregiver updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
}