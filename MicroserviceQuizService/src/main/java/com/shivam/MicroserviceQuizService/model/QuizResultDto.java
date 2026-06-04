package com.shivam.MicroserviceQuizService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response of POST /quiz/submit: the overall score plus a per-question breakdown.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {
    private int score;
    private int total;
    private List<AnswerResultDto> results;
}
