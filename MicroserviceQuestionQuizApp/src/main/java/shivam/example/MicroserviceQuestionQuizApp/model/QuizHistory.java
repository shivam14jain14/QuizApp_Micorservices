package shivam.example.MicroserviceQuestionQuizApp.model;

import lombok.Data;

@Data
public class QuizHistory {
    private Integer quizId;
    private String quizName;
    private String username;
    private String question;
    private String answer;
    private String correctAnswer;
}
