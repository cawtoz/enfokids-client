package com.github.cawtoz.enfokids.generic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public abstract class GenericService<T, ID, REQUEST, UPDATE_REQUEST, RESPONSE, MAPPER extends GenericMapper<T, REQUEST, UPDATE_REQUEST, RESPONSE>> {

    @Autowired
    protected JpaRepository<T, ID> repository;
    
    @Autowired
    protected MAPPER mapper;

    public List<RESPONSE> findAll() {
        return mapper.toResponseSet(repository.findAll());
    }

    public Optional<RESPONSE> findById(ID id) {
        return repository.findById(id).map(mapper::toResponse);
    }
    
    public RESPONSE create(REQUEST request) {
        T entity = mapper.toEntity(request);
        T saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    public Optional<RESPONSE> update(ID id, UPDATE_REQUEST request) {
        return repository.findById(id)
                .map(existing -> {
                    mapper.updateEntityFromUpdateRequest(request, existing);
                    T updated = repository.save(existing);
                    return mapper.toResponse(updated);
                });
    }

    public void deleteById(ID id) {
        repository.deleteById(id);
    }

}
