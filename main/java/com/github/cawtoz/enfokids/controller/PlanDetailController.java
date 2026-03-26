package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.cawtoz.enfokids.dto.request.PlanDetailRequest;
import com.github.cawtoz.enfokids.dto.request.PlanDetailUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.PlanDetailResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.PlanDetailService;

@RestController
@RequestMapping("/api/plan-details")
public class PlanDetailController extends GenericController<Long, PlanDetailRequest, PlanDetailUpdateRequest, PlanDetailResponse, PlanDetailService> {
    
}