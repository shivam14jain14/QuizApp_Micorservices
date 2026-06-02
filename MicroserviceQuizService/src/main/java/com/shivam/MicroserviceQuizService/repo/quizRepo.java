package com.shivam.MicroserviceQuizService.repo;

import com.shivam.MicroserviceQuizService.model.quizObj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface quizRepo extends JpaRepository<quizObj,Integer> {

    @Query("SELECT q FROM quizObj q WHERE :batch MEMBER OF q.batchIds")
    List<quizObj> findByBatchIdsContaining(String batch);
}
