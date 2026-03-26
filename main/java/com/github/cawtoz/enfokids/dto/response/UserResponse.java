package com.github.cawtoz.enfokids.dto.response;

import com.github.cawtoz.enfokids.model.role.RoleEnum;
import lombok.Data;

import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<RoleEnum> roles;
}
