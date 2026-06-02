package com.shivam.NotificationService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCreatedEvent {
    private String eventType;
    private Integer quizId;
    private String quizTitle;
    private String category;
    private List<String> batchIds;
    private Integer questionCount;
    private String sourceAction;
    private String message;
    private LocalDateTime createdAt;
}
