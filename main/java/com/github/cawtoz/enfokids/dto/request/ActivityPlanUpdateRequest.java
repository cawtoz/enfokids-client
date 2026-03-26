package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActivityPlanUpdateRequest {
    
    private Long therapistId;
    
    @Size(min = 3, max = 100, message = "El título debe tener entre 3 y 100 caracteres")
    private String title;
    
    @Size(max = 3000, message = "La descripción no puede exceder 3000 caracteres")
    private String description;
    
}
