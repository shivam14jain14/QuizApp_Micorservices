package com.shivam.MicroserviceQuizService.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class answerHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private int id;
    private String question;
    private String answer;
    private String correctAnswer;

    public answerHistory(String question, String response, String answer) {
        this.question = question;
        this.answer = response;
        this.correctAnswer = answer;
    }
}
