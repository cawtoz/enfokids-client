package com.github.cawtoz.enfokids.dto.request;

import com.github.cawtoz.enfokids.model.activity.enums.ActivityTypeEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActivityRequest {
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 100, message = "El título debe tener entre 3 y 100 caracteres")
    private String title;
    
    @Size(max = 3000, message = "La descripción no puede exceder 3000 caracteres")
    private String description;
    
    @NotNull(message = "El tipo de actividad es obligatorio")
    private ActivityTypeEnum type;
    
    private String imageUrl;
    
    private String resourceUrl;
    
}
