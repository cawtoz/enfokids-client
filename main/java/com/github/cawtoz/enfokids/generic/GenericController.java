package com.github.cawtoz.enfokids.generic;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class GenericController<
    ID, REQUEST, UPDATE_REQUEST, RESPONSE,
    SERVICE extends GenericService<?, ID, REQUEST, UPDATE_REQUEST, RESPONSE, ?>
> {

    @Autowired
    protected SERVICE service;

    @GetMapping
    public ResponseEntity<List<RESPONSE>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RESPONSE> getById(@PathVariable ID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RESPONSE> create(@Valid @RequestBody REQUEST request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RESPONSE> update(@PathVariable ID id, @Valid @RequestBody UPDATE_REQUEST request) {
        return service.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
