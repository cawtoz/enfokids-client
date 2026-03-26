package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.ProgressRequest;
import com.github.cawtoz.enfokids.dto.request.ProgressUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ProgressResponse;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.ProgressMapper;
import com.github.cawtoz.enfokids.model.activity.Progress;
import com.github.cawtoz.enfokids.repository.AssignmentRepository;
import com.github.cawtoz.enfokids.repository.ProgressRepository;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService extends GenericService<Progress, Long, ProgressRequest, ProgressUpdateRequest, ProgressResponse, ProgressMapper> {
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private ProgressRepository progressRepository;

    @Override
    public ProgressResponse create(ProgressRequest request) {
        Progress progress = mapper.toEntity(request);
        setAssignmentFromId(progress, request.getAssignmentId());
        Progress saved = repository.save(progress);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<ProgressResponse> update(Long id, ProgressUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    setAssignmentFromId(existing, request.getAssignmentId());
                    Progress updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
    private void setAssignmentFromId(Progress progress, Long assignmentId) {
        if (assignmentId != null) {
            progress.setAssignment(
                assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Asignación", "id", assignmentId))
            );
        }
    }

    // Nuevo: obtener progreso por assignmentId
    public List<ProgressResponse> findByAssignmentId(Long assignmentId) {
        List<Progress> list = progressRepository.findByAssignmentId(assignmentId);
        return list.stream().map(mapper::toResponse).collect(Collectors.toList());
    }

}