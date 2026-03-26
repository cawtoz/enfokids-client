package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CaregiverChildRequest {
    
    @NotNull(message = "El ID del cuidador es obligatorio")
    private Long caregiverId;
    
    @NotNull(message = "El ID del niño es obligatorio")
    private Long childId;
    
    @NotBlank(message = "La relación es obligatoria")
    @Size(min = 2, max = 30, message = "La relación debe tener entre 2 y 30 caracteres")
    private String relationship;
    
}
