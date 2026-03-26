package com.github.cawtoz.enfokids.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.cawtoz.enfokids.dto.request.RoleRequest;
import com.github.cawtoz.enfokids.dto.request.RoleUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.RoleResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.RoleService;

@RestController
@RequestMapping("/api/roles")
public class RoleController extends GenericController<Long, RoleRequest, RoleUpdateRequest, RoleResponse, RoleService> {
    
}