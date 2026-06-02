package com.shivam.MicroserviceQuizService.model;

import lombok.Data;

@Data
public class QuizDto {
     int id;
     String title;
     String category;

     public QuizDto(String title, String category, int id) {
          this.title = title;
          this.category = category;
          this.id = id;
     }
}
