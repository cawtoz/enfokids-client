package com.github.cawtoz.enfokids.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.cawtoz.enfokids.dto.request.CaregiverChildRequest;
import com.github.cawtoz.enfokids.dto.request.CaregiverChildUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.CaregiverChildResponse;
import com.github.cawtoz.enfokids.dto.response.CaregiverResponse;
import com.github.cawtoz.enfokids.exception.ResourceNotFoundException;
import com.github.cawtoz.enfokids.generic.GenericService;
import com.github.cawtoz.enfokids.mapper.CaregiverChildMapper;
import com.github.cawtoz.enfokids.mapper.ChildMapper;
import com.github.cawtoz.enfokids.mapper.CaregiverMapper;
import com.github.cawtoz.enfokids.model.relation.CaregiverChild;
import com.github.cawtoz.enfokids.repository.CaregiverRepository;
import com.github.cawtoz.enfokids.repository.ChildRepository;
import com.github.cawtoz.enfokids.repository.CaregiverChildRepository;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CaregiverChildService extends GenericService<CaregiverChild, Long, CaregiverChildRequest, CaregiverChildUpdateRequest, CaregiverChildResponse, CaregiverChildMapper> {

    @Autowired
    private CaregiverRepository caregiverRepository;
    
    @Autowired
    private ChildRepository childRepository;
    
    @Autowired
    private CaregiverChildRepository caregiverChildRepository;

    @Autowired
    private ChildMapper childMapper;

    @Autowired
    private CaregiverMapper caregiverMapper;

    @Override
    public CaregiverChildResponse create(CaregiverChildRequest request) {
        CaregiverChild caregiverChild = mapper.toEntity(request);
        setRelationsFromIds(caregiverChild, request.getCaregiverId(), request.getChildId());
        CaregiverChild saved = repository.save(caregiverChild);
        return mapper.toResponse(saved);
    }
    
    @Override
    public Optional<CaregiverChildResponse> update(Long id, CaregiverChildUpdateRequest request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    setRelationsFromIds(existing, request.getCaregiverId(), request.getChildId());
                    CaregiverChild updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }
    
    private void setRelationsFromIds(CaregiverChild caregiverChild, Long caregiverId, Long childId) {
        if (caregiverId != null) {
            caregiverChild.setCaregiver(
                caregiverRepository.findById(caregiverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cuidador", "id", caregiverId))
            );
        }
        if (childId != null) {
            caregiverChild.setChild(
                childRepository.findById(childId)
                    .orElseThrow(() -> new ResourceNotFoundException("Niño", "id", childId))
            );
        }
    }

    // Nuevo: obtener lista de ChildResponse pertenecientes a un cuidador
    public List<com.github.cawtoz.enfokids.dto.response.ChildResponse> findChildrenByCaregiverId(Long caregiverId) {
        List<CaregiverChild> relations = caregiverChildRepository.findByCaregiverId(caregiverId);
        return relations.stream()
                .map(CaregiverChild::getChild)
                .map(childMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Nuevo: obtener lista de CaregiverResponse pertenecientes a un niño
    public List<CaregiverResponse> findCaregiversByChildId(Long childId) {
        List<CaregiverChild> relations = caregiverChildRepository.findByChildId(childId);
        return relations.stream()
                .map(CaregiverChild::getCaregiver)
                .map(caregiverMapper::toResponse)
                .collect(Collectors.toList());
    }

}