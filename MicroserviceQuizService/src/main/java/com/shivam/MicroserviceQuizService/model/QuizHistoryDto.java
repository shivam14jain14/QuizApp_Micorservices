package com.shivam.MicroserviceQuizService.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class QuizHistoryDto {
    private int quizId;
    private String title;
    private String category;
    private List<String> batchIds;
    private String username;
    private boolean attempted;
    private Integer score;
}
