package com.github.cawtoz.enfokids.generic;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

public interface GenericMapper<T, REQUEST, UPDATE_REQUEST, RESPONSE> {

    RESPONSE toResponse(T entity);

    List<RESPONSE> toResponseSet(List<T> entities);
    
    @Mapping(target = "id", ignore = true)
    T toEntity(REQUEST request);
    
    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(REQUEST request, @MappingTarget T entity);
    
    @Mapping(target = "id", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromUpdateRequest(UPDATE_REQUEST request, @MappingTarget T entity);
    
}
