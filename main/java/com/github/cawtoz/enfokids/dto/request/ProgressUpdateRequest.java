package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProgressUpdateRequest {
    
    private Long assignmentId;
    
    @Size(max = 1000, message = "Las notas no pueden exceder 1000 caracteres")
    private String notes;
    
    private LocalDateTime date;
    
    private Boolean completed;
    
}
