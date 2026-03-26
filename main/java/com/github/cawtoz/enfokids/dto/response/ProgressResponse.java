package com.github.cawtoz.enfokids.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProgressResponse {
    private Long id;
    private Long assignmentId;
    private String notes;
    private LocalDateTime date;
    private Boolean completed;
}
