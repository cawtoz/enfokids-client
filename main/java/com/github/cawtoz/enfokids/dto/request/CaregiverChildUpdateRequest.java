package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CaregiverChildUpdateRequest {
    
    private Long caregiverId;
    
    private Long childId;
    
    @Size(min = 2, max = 30, message = "La relación debe tener entre 2 y 30 caracteres")
    private String relationship;
    
}
