package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.cawtoz.enfokids.dto.request.ActivityRequest;
import com.github.cawtoz.enfokids.dto.request.ActivityUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.ActivityResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.ActivityService;

@RestController
@RequestMapping("/api/activities")
public class ActivityController extends GenericController<Long, ActivityRequest, ActivityUpdateRequest, ActivityResponse, ActivityService> {
    
}