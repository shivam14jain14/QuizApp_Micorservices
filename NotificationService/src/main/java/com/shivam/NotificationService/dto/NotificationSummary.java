package com.shivam.NotificationService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSummary {
    private Long id;
    private String title;
    private String message;
    private String eventType;
    private String topic;
    private Integer quizId;
    private String recipientType;
    private String recipientIdentifier;
    private String notificationStatus;
    private String readStatus;
    private java.time.LocalDateTime createdAt;
}
