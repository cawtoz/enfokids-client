package com.github.cawtoz.enfokids.dto.request;

import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PlanDetailRequest {
    
    @NotNull(message = "El ID del plan es obligatorio")
    private Long planId;
    
    @NotNull(message = "El ID de la actividad es obligatorio")
    private Long activityId;
    
    @NotNull(message = "La unidad de frecuencia es obligatoria")
    private FrequencyUnitEnum frequencyUnit;
    
    @NotNull(message = "El conteo de frecuencia es obligatorio")
    @Positive(message = "El conteo de frecuencia debe ser un número positivo")
    private Integer frequencyCount;
    
    @NotNull(message = "Las repeticiones son obligatorias")
    @Positive(message = "Las repeticiones deben ser un número positivo")
    private Integer repetitions;
    
    @Positive(message = "La duración estimada debe ser un número positivo")
    private Integer estimatedDuration;
    
}
