package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.*;

import com.github.cawtoz.enfokids.dto.request.CaregiverRequest;
import com.github.cawtoz.enfokids.dto.request.CaregiverUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.CaregiverResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.CaregiverService;

@RestController
@RequestMapping("/api/caregivers")
public class CaregiverController extends GenericController<Long, CaregiverRequest, CaregiverUpdateRequest, CaregiverResponse, CaregiverService> {
    
}