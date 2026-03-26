package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.AssignmentRequest;
import com.github.cawtoz.enfokids.dto.request.AssignmentUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.AssignmentResponse;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.AssignmentMapper;
import com.github.cawtoz.enfokids.model.activity.Assignment;
import com.github.cawtoz.enfokids.repository.ActivityRepository;
import com.github.cawtoz.enfokids.repository.ChildRepository;
import com.github.cawtoz.enfokids.repository.TherapistRepository;
import com.github.cawtoz.enfokids.repository.AssignmentRepository;
import com.github.cawtoz.enfokids.model.activity.enums.AssignmentStatusEnum;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentService extends GenericService<Assignment, Long, AssignmentRequest, AssignmentUpdateRequest, AssignmentResponse, AssignmentMapper> {

    @Autowired
    private TherapistRepository therapistRepository;
    
    @Autowired
    private ChildRepository childRepository;
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private AssignmentRepository assignmentRepository;

    @Override
    public AssignmentResponse create(AssignmentRequest request) {
        Assignment assignment = mapper.toEntity(request);
        setRelationsFromIds(assignment, request.getTherapistId(), request.getChildId(), request.getActivityId());
        Assignment saved = repository.save(assignment);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<AssignmentResponse> update(Long id, AssignmentUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    setRelationsFromIds(existing, request.getTherapistId(), request.getChildId(), request.getActivityId());
                    Assignment updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
    private void setRelationsFromIds(Assignment assignment, Long therapistId, Long childId, Long activityId) {
        if (therapistId != null) {
            assignment.setTherapist(
                therapistRepository.findById(therapistId)
                    .orElseThrow(() -> new ResourceNotFoundException("Terapeuta", "id", therapistId))
            );
        }
        if (childId != null) {
            assignment.setChild(
                childRepository.findById(childId)
                    .orElseThrow(() -> new ResourceNotFoundException("Niño", "id", childId))
            );
        }
        if (activityId != null) {
            assignment.setActivity(
                activityRepository.findById(activityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Actividad", "id", activityId))
            );
        }
    }
    
    // Nuevo: obtener asignaciones por childId
    public List<AssignmentResponse> findByChildId(Long childId) {
        List<Assignment> list = assignmentRepository.findByChildId(childId);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    // Nuevo: obtener asignaciones por estado
    public List<AssignmentResponse> findByStatus(AssignmentStatusEnum status) {
        List<Assignment> list = assignmentRepository.findByStatus(status);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    // Nuevo: obtener asignaciones por childId y estado
    public List<AssignmentResponse> findByChildIdAndStatus(Long childId, AssignmentStatusEnum status) {
        List<Assignment> list = assignmentRepository.findByChildIdAndStatus(childId, status);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

    // Conveniencia: decide según parámetros opcionales
    public List<AssignmentResponse> findByOptionalFilters(Long childId, AssignmentStatusEnum status) {
        if (childId != null && status != null) {
            return findByChildIdAndStatus(childId, status);
        }
        if (childId != null) {
            return findByChildId(childId);
        }
        if (status != null) {
            return findByStatus(status);
        }
        return findAll();
    }

}