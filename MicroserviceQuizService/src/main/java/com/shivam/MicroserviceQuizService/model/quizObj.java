package com.shivam.MicroserviceQuizService.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
@Entity
@Data
public class quizObj {
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private int id;
    private String title;
    private String category;
//    @ManyToMany
    @ElementCollection
    private List<Integer> questionIds;
    @ElementCollection
    private List<String> batchIds;
}
