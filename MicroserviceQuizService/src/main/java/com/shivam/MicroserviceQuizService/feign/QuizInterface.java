package com.shivam.MicroserviceQuizService.feign;

import com.shivam.MicroserviceQuizService.model.QuestionObj;
import com.shivam.MicroserviceQuizService.model.QuestionWrapper;
import com.shivam.MicroserviceQuizService.model.userQuizObj;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient("MICROSERVICEQUESTIONQUIZAPP")
public interface QuizInterface {
    @GetMapping("/question/generate")
    ResponseEntity<List<Integer>> getQuestionsForQuiz(@RequestParam String category);

    @PostMapping("/question/getQuestions")
     ResponseEntity<List<QuestionWrapper>> getQuestionsByIds(@RequestBody List<Integer> Ids);

    @PostMapping("/question/getScores")
    ResponseEntity<Integer> getScores( @RequestBody  List<userQuizObj> l);
    @GetMapping("/question/getQues/{id}")
    ResponseEntity<QuestionObj> getQuestionById(@PathVariable Integer id);
    @PostMapping("/question/addQues")
    ResponseEntity<Integer> addQuestioninDB(@RequestBody QuestionObj question);
}
