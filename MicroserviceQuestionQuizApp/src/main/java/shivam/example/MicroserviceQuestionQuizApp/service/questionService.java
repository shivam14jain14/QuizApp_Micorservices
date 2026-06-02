package shivam.example.MicroserviceQuestionQuizApp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import shivam.example.MicroserviceQuestionQuizApp.model.QuestionObj;
import shivam.example.MicroserviceQuestionQuizApp.model.QuestionWrapper;
import shivam.example.MicroserviceQuestionQuizApp.model.ResponseObj;
import shivam.example.MicroserviceQuestionQuizApp.repo.questionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class questionService {
    private static final Logger logger = LoggerFactory.getLogger(questionService.class);

    @Autowired
    private questionRepo questionR;

    public Page<QuestionObj> getAllQuestions(
            String keyword,
            int page, int size,
            String sortBy, String dir) {
        Sort.Direction direction = dir.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        if (keyword != null && !keyword.isBlank()) {
            logger.info("Searching questions with keyword: {}", keyword);
            return questionR.findByCategoryOrQuestionOrAnswerContaining(keyword, keyword, keyword, pageable);
        } else {
            logger.info("Fetching all questions (no keyword)");
            return questionR.findAll(pageable);
        }
    }

    public ResponseEntity<List<QuestionObj>> getAllQuestionsByCategory(String category) {
        try {
            logger.info("Fetching questions by category: {}", category);
            return new ResponseEntity<>(questionR.findByCategory(category), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching questions by category: {}", category, e);
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<List<String>> getDistinctCategories() {
        logger.info("Fetching distinct question categories");
        return new ResponseEntity<>(questionR.findDistinctCategories(), HttpStatus.OK);
    }

    public void addQuestion(QuestionObj question) {
        logger.info("Saving new question");
        questionR.save(question);
    }

    public ResponseEntity<List<Integer>> getQuestionsForQuiz(String category) {
        logger.info("Fetching random questions for quiz, category: {}", category);
        List<Integer> questions = questionR.findRandomQuestionsByCategory(category);
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuestionsByIds(List<Integer> Ids) {

        List<QuestionWrapper> questions = new ArrayList<>();
        List<QuestionObj> ques=new ArrayList<>();
        for(Integer i :Ids)
        {
            ques.add(questionR.findById(i).get());
        }
        for(QuestionObj q:ques)
        {
            QuestionWrapper qq=new QuestionWrapper(q.getId(),q.getQuestion(),q.getOption1(),q.getOption2(),q.getOption3(),q.getOption4());
           questions.add(qq);
        }
//        List<QuestionObj> ques=questionR.findAllById(Ids);
//        for(QuestionObj q:ques)
//        {
//            QuestionWrapper qq=new QuestionWrapper(q.getId(),q.getQuestion_title(),q.getOption1(),q.getOption2(),q.getOption3(),q.getOption4());
//            questions.add(qq);
//        }

                return new ResponseEntity<>(questions,HttpStatus.OK) ;
    }

    public ResponseEntity<Integer> getScores(List<ResponseObj> l) {
        int cnt=0;
        for(ResponseObj r:l)
        {
            if(questionR.findById(r.getQuesId()).get().getAnswer().equals(r.getResponse()))
                cnt++;

        }
        return new ResponseEntity<>(cnt,HttpStatus.OK) ;
    }

    public ResponseEntity<QuestionObj> getQuestionById(Integer id) {
        return questionR.findById(id)
                .map(question -> new ResponseEntity<>(question, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    public ResponseEntity<Integer> addQues(QuestionObj question) {
        try{
           QuestionObj qObj= questionR.save(question);
            return new ResponseEntity<>(qObj.getId(), HttpStatus.CREATED);}
        catch(Exception e){e.printStackTrace();}
        return new ResponseEntity<>(-1,HttpStatus.BAD_REQUEST);
    }
}
