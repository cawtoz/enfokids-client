package com.github.cawtoz.enfokids.dto.response;

import com.github.cawtoz.enfokids.model.activity.enums.ActivityTypeEnum;
import lombok.Data;

@Data
public class ActivityResponse {
    private Long id;
    private String title;
    private String description;
    private ActivityTypeEnum type;
    private String imageUrl;
    private String resourceUrl;
}
