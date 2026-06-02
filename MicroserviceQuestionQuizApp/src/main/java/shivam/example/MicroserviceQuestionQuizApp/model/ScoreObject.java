package shivam.example.MicroserviceQuestionQuizApp.model;

import lombok.Data;

import java.util.List;

@Data
public class ScoreObject {
    private int score;
    private List<QuizHistory> quizHistory;
}
