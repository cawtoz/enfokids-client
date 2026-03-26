package com.github.cawtoz.enfokids.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ChildResponse extends UserResponse {
    
    private TherapistResponse therapist;
    private String diagnosis;
    
}
