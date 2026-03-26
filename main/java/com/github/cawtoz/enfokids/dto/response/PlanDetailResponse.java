package com.github.cawtoz.enfokids.dto.response;

import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;
import lombok.Data;

@Data
public class PlanDetailResponse {
    private Long id;
    private Long planId;
    private String planTitle;
    private Long activityId;
    private String activityTitle;
    private FrequencyUnitEnum frequencyUnit;
    private Integer frequencyCount;
    private Integer repetitions;
    private Integer estimatedDuration;
}
