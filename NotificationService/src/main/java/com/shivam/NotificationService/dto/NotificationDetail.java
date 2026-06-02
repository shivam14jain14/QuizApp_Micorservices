package com.shivam.NotificationService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDetail {
    private Long id;
    private String eventType;
    private String topic;
    private Integer quizId;
    private String title;
    private String message;
    private LocalDateTime createdAt;
}
