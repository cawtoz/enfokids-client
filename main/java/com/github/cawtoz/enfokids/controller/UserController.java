package com.github.cawtoz.enfokids.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.github.cawtoz.enfokids.dto.request.UserRequest;
import com.github.cawtoz.enfokids.dto.request.UserUpdateRequest;
import com.github.cawtoz.enfokids.dto.response.UserResponse;
import com.github.cawtoz.enfokids.generic.GenericController;
import com.github.cawtoz.enfokids.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController extends GenericController<Long, UserRequest, UserUpdateRequest, UserResponse, UserService> {

    @Autowired
    protected UserService service;

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return service.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}