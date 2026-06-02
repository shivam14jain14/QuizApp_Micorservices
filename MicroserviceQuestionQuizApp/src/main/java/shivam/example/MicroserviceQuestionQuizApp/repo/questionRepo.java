package shivam.example.MicroserviceQuestionQuizApp.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import shivam.example.MicroserviceQuestionQuizApp.model.QuestionObj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface questionRepo extends JpaRepository<QuestionObj,Integer> {
    Page<QuestionObj> findAll(Pageable pageable);
    List<QuestionObj> findByCategory(String category);
@Query(value="SELECT q.id from question q where q.category =:category ORDER BY RANDOM() Limit 5",nativeQuery=true)
List<Integer> findRandomQuestionsByCategory(String category);

@Query("SELECT DISTINCT q.category FROM question q WHERE q.category IS NOT NULL AND q.category <> '' ORDER BY q.category")
List<String> findDistinctCategories();

Page<QuestionObj> findByCategoryOrQuestionOrAnswerContaining(String qText,
                                                                 String cText,
                                                                 String aText,
                                                                 Pageable pageable);
}
