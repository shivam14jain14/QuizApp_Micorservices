package com.shivam.MicroserviceQuizService.repo;
import com.shivam.MicroserviceQuizService.model.QuizHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface quizHistoryRepo extends JpaRepository<QuizHistory,Integer> {
    Optional<QuizHistory> findByQuizIdAndUsername(int quizId, String username);

    List<QuizHistory> findByUsernameIgnoreCase(String username);

    List<QuizHistory> findByQuizId(int quizId);
}
