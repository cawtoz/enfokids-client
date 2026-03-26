package com.github.cawtoz.enfokids.dto.request;

import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PlanDetailUpdateRequest {
    
    private Long planId;
    
    private Long activityId;
    
    private FrequencyUnitEnum frequencyUnit;
    
    @Positive(message = "El conteo de frecuencia debe ser un número positivo")
    private Integer frequencyCount;
    
    @Positive(message = "Las repeticiones deben ser un número positivo")
    private Integer repetitions;
    
    @Positive(message = "La duración estimada debe ser un número positivo")
    private Integer estimatedDuration;
    
}
