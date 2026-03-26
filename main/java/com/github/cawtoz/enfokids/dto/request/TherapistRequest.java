package com.github.cawtoz.enfokids.dto.request;

import com.github.cawtoz.enfokids.validation.UniqueEmail;
import com.github.cawtoz.enfokids.validation.UniqueUsername;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TherapistRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 20, message = "El nombre debe tener entre 3 y 20 caracteres")
    @UniqueUsername
    private String username;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 60, message = "La contraseña debe tener entre 6 y 60 caracteres")
    private String password;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe ser válido")
    @Size(max = 60, message = "El email no puede exceder 60 caracteres")
    @UniqueEmail
    private String email;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 40, message = "El nombre debe tener entre 2 y 40 caracteres")
    private String firstName;
    
    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 40, message = "El apellido debe tener entre 2 y 40 caracteres")
    private String lastName;
    
    @NotBlank(message = "La especialidad es obligatoria")
    @Size(min = 2, max = 30, message = "La especialidad debe tener entre 2 y 30 caracteres")
    private String speciality;
    
}
