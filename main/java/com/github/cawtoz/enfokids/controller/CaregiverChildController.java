package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import com.github.cawtoz.enfokids.dto.request.CaregiverChildRequest;
import com.github.cawtoz.enfokids.dto.request.CaregiverChildUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.CaregiverChildResponse;
import com.github.cawtoz.enfokids.dto.response.ChildResponse;
import com.github.cawtoz.enfokids.dto.response.CaregiverResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.CaregiverChildService;

@RestController
@RequestMapping("/api/caregiver-children")
public class CaregiverChildController extends GenericController<Long, CaregiverChildRequest, CaregiverChildUpdateRequest, CaregiverChildResponse, CaregiverChildService> {

    @GetMapping(params = "caregiverId")
    public ResponseEntity<List<ChildResponse>> getChildrenByCaregiverId(@RequestParam Long caregiverId) {
        List<ChildResponse> list = service.findChildrenByCaregiverId(caregiverId);
        return ResponseEntity.ok(list);
    }

    @GetMapping(params = "childId")
    public ResponseEntity<List<CaregiverResponse>> getCaregiversByChildId(@RequestParam Long childId) {
        List<CaregiverResponse> list = service.findCaregiversByChildId(childId);
        return ResponseEntity.ok(list);
    }

}