package com.github.cawtoz.enfokids.service;

import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.model.user.types.Therapist;
import com.github.cawtoz.enfokids.repository.TherapistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.ChildRequest;
import com.github.cawtoz.enfokids.dto.request.ChildUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ChildResponse;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.ChildMapper;
import com.github.cawtoz.enfokids.model.role.RoleEnum;
import com.github.cawtoz.enfokids.model.user.types.Child;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChildService extends GenericService<Child, Long, ChildRequest, ChildUpdateRequest, ChildResponse, ChildMapper> {

    @Autowired
    private RoleService roleService;

    @Autowired
    private TherapistRepository therapistRepository;

    @Override
    public ChildResponse create(ChildRequest request) {
        Child child = mapper.toEntity(request);
        Therapist therapist = therapistRepository.findById(request.getTherapistId())
                .orElseThrow(() -> new ResourceNotFoundException("Therapist not found with id: " + request.getTherapistId()));
        child.setTherapist(therapist);
        roleService.assignRoleToUser(child, RoleEnum.CHILD);
        Child saved = repository.save(child);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<ChildResponse> update(Long id, ChildUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    Child updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }

    // Nuevo: obtener niños por terapeuta
    public List<ChildResponse> findByTherapistId(Long therapistId) {
        List<Child> list = ((com.github.cawtoz.enfokids.repository.ChildRepository) repository).findByTherapistId(therapistId);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

}