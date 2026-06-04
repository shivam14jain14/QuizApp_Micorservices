package com.shivam.MicroserviceQuizService.controller;

import com.shivam.MicroserviceQuizService.model.*;
import com.shivam.MicroserviceQuizService.service.quizService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
public class quizController {
    private static final Logger logger = LoggerFactory.getLogger(quizController.class);

    @Autowired
    quizService quizSer;
    //tested but kafke publish events are failing
    @PostMapping("/generate")
    public ResponseEntity<String> generateQuizWithQuestions(@RequestBody quizObj quizDto) {
        logger.info("Received request to generate quiz: {}", quizDto);
        return quizSer.generateQuiz(quizDto.getTitle(), quizDto.getCategory(), quizDto.getQuestionIds(), quizDto.getBatchIds());
    }
    //tested
    @GetMapping("/questions/{category}")
    public ResponseEntity<List<QuestionWrapper>> getDBQuestions(@PathVariable String category) {
        logger.info("Fetching DB questions for category: {}", category);
        return quizSer.getQuizQuestionsfromDB(category);
    }
    //tested
    @GetMapping("/{quizId}")
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestionsById(@PathVariable int quizId,
                                                                      @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        logger.info("Fetching quiz questions for quizId: {}", quizId);
        return quizSer.getQuizQuestionsById(quizId, authorizationHeader);
    }
    //tested
    @GetMapping("/batch/{batch}")
    public ResponseEntity<List<QuizDto>> getQuizIdsByBatch(@PathVariable String batch) {
        logger.info("Fetching quizzes for batch: {}", batch);
        return quizSer.getAllQuizesForABatch(batch);
    }
    @GetMapping("/history")
    public ResponseEntity<List<QuizHistoryDto>> getQuizHistory(@RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                               @RequestParam(required = false) String username,
                                                               @RequestParam(required = false) String batch) {
        logger.info("Fetching quiz history, username: {}, batch: {}", username, batch);
        return quizSer.getQuizHistory(authorizationHeader, username, batch);
    }
    //tested
    @PostMapping("/submit")
    public ResponseEntity<QuizResultDto> getCorrectAnswers(@RequestBody ResponseObj responseObj) {
        logger.info("Submitting quiz for scoring");
        return quizSer.getCorrectAnswers(responseObj);
    }
    @GetMapping("/{quizId}/review")
    public ResponseEntity<QuizResultDto> reviewAttempt(@PathVariable int quizId,
                                                       @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        logger.info("Fetching attempt review for quizId: {}", quizId);
        return quizSer.getAttemptReview(quizId, authorizationHeader);
    }

    //tested
    @GetMapping("/ai-questions")
    public ResponseEntity<List<QuestionObj>> getAiGeneratedQuestions(@RequestParam String category, @RequestParam String level) {
        logger.info("Fetching AI generated questions for category: {}, level: {}", category, level);
        return quizSer.getAiGeneratedQuestions(category, level);
    }

    @GetMapping("/present")
    public void getPresent() {
        logger.info("Present endpoint called");
    }

    //tested
    @PostMapping("/finalize")
    public ResponseEntity<String> finalizeQuiz(@RequestBody CreateQuizBody quizBody) {
        logger.info("Finalizing quiz");
        return quizSer.buildQuiz(quizBody.getQuiz(), quizBody.getAiquestions());
    }
}
