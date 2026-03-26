package com.github.cawtoz.enfokids.dto.request;

import com.github.cawtoz.enfokids.model.role.RoleEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleRequest {
    
    @NotNull(message = "El nombre del rol es obligatorio")
    private RoleEnum name;
    
}
