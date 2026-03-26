package com.github.cawtoz.enfokids.dto.response;

import com.github.cawtoz.enfokids.model.role.RoleEnum;
import lombok.Data;

@Data
public class RoleResponse {
    private Long id;
    private RoleEnum name;
}
