package com.github.cawtoz.enfokids.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TherapistResponse extends UserResponse {
    private String speciality;
}
