package com.shivam.MicroserviceQuizService.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "quiz_history",
        uniqueConstraints = @UniqueConstraint(columnNames = {"quizId", "username"})
)
public class QuizHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private int id;
    private int quizId;
    private String username;
    private int score;
//    @ManyToMany
    @ManyToMany(cascade = CascadeType.ALL)
    List<answerHistory> answerObj;


    public QuizHistory(Integer quizId,String username,Integer score, List<answerHistory> answerObj) {
        this.username = username;
        this.answerObj = answerObj;
        this.score = score;
        this.quizId = quizId;
    }

}
