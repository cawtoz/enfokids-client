package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import com.github.cawtoz.enfokids.dto.request.AssignmentRequest;
import com.github.cawtoz.enfokids.dto.request.AssignmentUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.AssignmentResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.AssignmentService;
import com.github.cawtoz.enfokids.model.activity.enums.AssignmentStatusEnum;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController extends GenericController<Long, AssignmentRequest, AssignmentUpdateRequest, AssignmentResponse, AssignmentService> {

    @GetMapping(params = {"childId", "status"})
    public ResponseEntity<List<AssignmentResponse>> getByChildIdAndStatus(
            @RequestParam Long childId,
            @RequestParam AssignmentStatusEnum status) {
        List<AssignmentResponse> list = service.findByChildIdAndStatus(childId, status);
        return ResponseEntity.ok(list);
    }

    @GetMapping(params = "childId")
    public ResponseEntity<List<AssignmentResponse>> getByChildId(@RequestParam Long childId) {
        List<AssignmentResponse> list = service.findByChildId(childId);
        return ResponseEntity.ok(list);
    }

    @GetMapping(params = "status")
    public ResponseEntity<List<AssignmentResponse>> getByStatus(@RequestParam AssignmentStatusEnum status) {
        List<AssignmentResponse> list = service.findByStatus(status);
        return ResponseEntity.ok(list);
    }

}