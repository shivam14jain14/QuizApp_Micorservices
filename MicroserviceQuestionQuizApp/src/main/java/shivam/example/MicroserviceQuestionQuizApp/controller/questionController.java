package shivam.example.MicroserviceQuestionQuizApp.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import shivam.example.MicroserviceQuestionQuizApp.model.QuestionObj;
import shivam.example.MicroserviceQuestionQuizApp.model.QuestionWrapper;
import shivam.example.MicroserviceQuestionQuizApp.model.ResponseObj;
import shivam.example.MicroserviceQuestionQuizApp.service.questionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/question")
public class questionController {
    private static final Logger logger = LoggerFactory.getLogger(questionController.class);

    @Autowired
    private questionService questionS;
    @Autowired
    Environment environment;

    //tested
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllQues(
            @RequestParam(defaultValue = "") String key,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String dir) {
        logger.info("Fetching all questions with key: {}", key);
        Page<QuestionObj> result = questionS.getAllQuestions(key, page, size, sortBy, dir);
        Map<String, Object> resp = new HashMap<>();
        resp.put("questions", result.getContent());
        resp.put("currentPage", result.getNumber());
        resp.put("totalItems", result.getTotalElements());
        resp.put("totalPages", result.getTotalPages());
        return new ResponseEntity<>(resp, HttpStatus.OK);
    }
    //tested
    @GetMapping("/category/{category}")
    public ResponseEntity<List<QuestionObj>> getAllQuestionsByCategory(@PathVariable String category) {
        logger.info("Fetching questions by category: {}", category);
        return questionS.getAllQuestionsByCategory(category);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        logger.info("Fetching distinct categories");
        return questionS.getDistinctCategories();
    }

    //tested
    @PostMapping("/add")
    public ResponseEntity<Void> addQuestion(@RequestBody QuestionObj question) {
        logger.info("Adding new question");
        questionS.addQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    //tested only returns the list of random 5 ques
    @GetMapping("/generate")
    public ResponseEntity<List<Integer>> getQuestionsForQuiz(@RequestParam String category) {
        logger.info("Generating questions for quiz, category: {}", category);
        return questionS.getQuestionsForQuiz(category);
    }
    //tested
    @GetMapping("/getQues/{id}")
    public ResponseEntity<QuestionObj> getQuestionById(@PathVariable Integer id)
    {
        return questionS.getQuestionById(id);
    }
    @PostMapping("getQuestions")
    public ResponseEntity<List<QuestionWrapper>> getQuestionsByIds(@RequestBody List<Integer> Ids)
    {
        System.out.println(environment.getProperty("local.server.port"));
        return questionS.getQuestionsByIds(Ids);
    }
    @PostMapping("getScores")
    public ResponseEntity<Integer> getScores(@RequestBody  List<ResponseObj> l)
    {
        return questionS.getScores(l);
    }
    @PostMapping("addQues")
    public ResponseEntity<Integer> addQuestioninDB(@RequestBody QuestionObj question){
        return questionS.addQues(question);
    }

}
