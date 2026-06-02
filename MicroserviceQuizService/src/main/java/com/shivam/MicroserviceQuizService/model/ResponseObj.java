package com.shivam.MicroserviceQuizService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseObj {
    private Integer quizId;
    private String username;
    List<userQuizObj> userResponses;
}
