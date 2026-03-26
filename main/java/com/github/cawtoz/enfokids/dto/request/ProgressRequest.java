package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProgressRequest {
    
    @NotNull(message = "El ID de la asignación es obligatorio")
    private Long assignmentId;
    
    @Size(max = 1000, message = "Las notas no pueden exceder 1000 caracteres")
    private String notes;
    
    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime date;
    
    @NotNull(message = "El estado de completado es obligatorio")
    private Boolean completed;
    
}
