package com.github.cawtoz.enfokids.dto.request;

import com.github.cawtoz.enfokids.model.role.RoleEnum;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    
    private RoleEnum name;
    
}
