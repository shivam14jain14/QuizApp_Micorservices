package com.shivam.MicroserviceQuizService.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Data
@Component
@NoArgsConstructor
@AllArgsConstructor
public class QuestionObj {
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private int id;
    private String category;
    private String question;
    private String answer;
    private String difficultylevel;
    private String option1;
    private String option2;
    private String option3;
    private String option4;



}
