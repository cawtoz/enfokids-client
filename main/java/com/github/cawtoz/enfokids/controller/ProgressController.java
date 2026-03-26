package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import com.github.cawtoz.enfokids.dto.request.ProgressRequest;
import com.github.cawtoz.enfokids.dto.request.ProgressUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ProgressResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.ProgressService;

@RestController
@RequestMapping("/api/progress")
public class ProgressController extends GenericController<Long, ProgressRequest, ProgressUpdateRequest, ProgressResponse, ProgressService> {

    @GetMapping(params = "assignmentId")
    public ResponseEntity<List<ProgressResponse>> getByAssignmentId(@RequestParam Long assignmentId) {
        List<ProgressResponse> list = service.findByAssignmentId(assignmentId);
        return ResponseEntity.ok(list);
    }

}