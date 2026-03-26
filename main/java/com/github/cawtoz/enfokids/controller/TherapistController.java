package com.github.cawtoz.enfokids.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.cawtoz.enfokids.dto.request.TherapistRequest;
import com.github.cawtoz.enfokids.dto.request.TherapistUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ChildResponse;
import com.github.cawtoz.enfokids.dto.response.TherapistResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.TherapistService;

@RestController
@RequestMapping("/api/therapists")
public class TherapistController extends GenericController<Long, TherapistRequest, TherapistUpdateRequest, TherapistResponse, TherapistService> {
    
    @GetMapping("/{therapistId}/children")
    public ResponseEntity<List<ChildResponse>> getChildrenByTherapist(@PathVariable Long therapistId) {
        List<ChildResponse> children = service.getChildrenByTherapistId(therapistId);
        return ResponseEntity.ok(children);
    }
    
    @GetMapping("/me/children")
    public ResponseEntity<List<ChildResponse>> getMyChildren() {
        List<ChildResponse> children = service.getMyChildren();
        return ResponseEntity.ok(children);
    }
    
}