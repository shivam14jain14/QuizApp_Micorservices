package com.shivam.MicroserviceQuizService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Per-question result returned after a quiz submission so the client can show
 * which answers were correct and which were not.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResultDto {
    private int quesId;
    private String question;
    private String userResponse;
    private String correctAnswer;
    private boolean correct;
}
