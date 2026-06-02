package com.shivam.MicroserviceQuizService.model;

import lombok.Data;

import java.util.Set;

@Data
public class CreateQuizBody {
    quizObj quiz;
    Set<QuestionObj> aiquestions;
}
