package com.github.cawtoz.enfokids.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChildUpdateRequest {
    
    @Size(min = 3, max = 20, message = "El nombre debe tener entre 3 y 20 caracteres")
    private String username;
    
    @Size(min = 6, max = 60, message = "La contraseña debe tener entre 6 y 60 caracteres")
    private String password;
    
    @Email(message = "El email debe ser válido")
    @Size(max = 60, message = "El email no puede exceder 60 caracteres")
    private String email;
    
    @Size(min = 2, max = 40, message = "El nombre debe tener entre 2 y 40 caracteres")
    private String firstName;
    
    @Size(min = 2, max = 40, message = "El apellido debe tener entre 2 y 40 caracteres")
    private String lastName;
    
    @Positive(message = "El ID del terapeuta debe ser un número positivo")
    private Long therapistId;
    
    @Size(max = 500, message = "El diagnóstico no puede exceder 500 caracteres")
    private String diagnosis;
    
}
