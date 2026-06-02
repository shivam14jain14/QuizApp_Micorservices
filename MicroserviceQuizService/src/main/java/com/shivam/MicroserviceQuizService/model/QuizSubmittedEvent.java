package com.shivam.MicroserviceQuizService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmittedEvent {
    private String eventType;
    private Integer quizId;
    private String username;
    private Integer score;
    private String message;
    private LocalDateTime submittedAt;
}
