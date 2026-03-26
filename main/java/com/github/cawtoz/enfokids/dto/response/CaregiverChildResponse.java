package com.github.cawtoz.enfokids.dto.response;

import lombok.Data;

@Data
public class CaregiverChildResponse {
    private Long id;
    private Long caregiverId;
    private String caregiverName;
    private Long childId;
    private String childName;
    private String relationship;
}
