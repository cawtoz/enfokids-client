package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActivityPlanRequest {
    
    @NotNull(message = "El ID del terapeuta es obligatorio")
    private Long therapistId;
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 100, message = "El título debe tener entre 3 y 100 caracteres")
    private String title;
    
    @Size(max = 3000, message = "La descripción no puede exceder 3000 caracteres")
    private String description;
    
}
