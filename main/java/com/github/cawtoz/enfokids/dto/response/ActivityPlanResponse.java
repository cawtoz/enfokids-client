package com.github.cawtoz.enfokids.dto.response;

import lombok.Data;

@Data
public class ActivityPlanResponse {
    private Long id;
    private Long therapistId;
    private String therapistName;
    private String title;
    private String description;
}
