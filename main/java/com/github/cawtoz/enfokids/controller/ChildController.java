package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import com.github.cawtoz.enfokids.dto.request.ChildRequest;
import com.github.cawtoz.enfokids.dto.request.ChildUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ChildResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.ChildService;

@RestController
@RequestMapping("/api/children")
public class ChildController extends GenericController<Long, ChildRequest, ChildUpdateRequest, ChildResponse, ChildService> {

    @GetMapping(params = "therapistId")
    public ResponseEntity<List<ChildResponse>> getByTherapistId(@RequestParam Long therapistId) {
        List<ChildResponse> list = service.findByTherapistId(therapistId);
        return ResponseEntity.ok(list);
    }

}