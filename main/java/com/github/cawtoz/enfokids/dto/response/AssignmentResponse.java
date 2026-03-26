package com.github.cawtoz.enfokids.dto.response;

import com.github.cawtoz.enfokids.model.activity.enums.AssignmentStatusEnum;
import com.github.cawtoz.enfokids.model.activity.enums.FrequencyUnitEnum;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentResponse {
    private Long id;
    private Long therapistId;
    private String therapistName;
    private Long childId;
    private String childName;
    private Long activityId;
    private String activityTitle;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private FrequencyUnitEnum frequencyUnit;
    private Integer frequencyCount;
    private Integer repetitions;
    private Integer estimatedDuration;
    private AssignmentStatusEnum status;
}
