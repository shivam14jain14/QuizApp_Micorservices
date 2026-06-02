package com.shivam.MicroserviceQuizService.service;

import com.shivam.MicroserviceQuizService.feign.QuizInterface;
import com.shivam.MicroserviceQuizService.feign.UserInterface;
import com.shivam.MicroserviceQuizService.model.*;
import com.shivam.MicroserviceQuizService.repo.quizHistoryRepo;
import com.shivam.MicroserviceQuizService.repo.quizRepo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class quizService {
    private static final Logger logger = LoggerFactory.getLogger(quizService.class);

    private OpenAiChatModel chatModel;

    public quizService(OpenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Autowired
    quizRepo quizRepo;
    @Autowired
    quizHistoryRepo quizHistoryRepo;
    @Autowired
    QuizInterface quizInterface;
    @Autowired
    UserInterface userInterface;
    @Autowired
    JwtService jwtService;
    @Autowired
    OutboxEventService outboxEventService;

    @Value("${app.kafka.topic.quiz-created}")
    private String quizCreatedTopic;

    @Value("${app.kafka.topic.quiz-submitted}")
    private String quizSubmittedTopic;

    @Transactional
    public ResponseEntity<String> generateQuiz(String title, String category, List<Integer> quesIds, List<String> batch) {
        logger.info("Generating quiz with title: {}, category: {}, batch: {}", title, category, batch);
        quizObj quizObj = new quizObj();
        quizObj.setTitle(title);
        quizObj.setCategory(category);
        quizObj.setQuestionIds(quesIds);
        quizObj.setBatchIds(batch);
        quizObj savedQuiz = quizRepo.save(quizObj);
        createQuizCreatedOutboxEvent(savedQuiz, "GENERATE");
        return new ResponseEntity<>("Success", HttpStatus.CREATED);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestionsById(int quizId, String authorizationHeader) {
        logger.info("Fetching questions for quizId: {}", quizId);
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            logger.warn("Authorization bearer token is required to fetch quiz id: {}", quizId);
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String token = authorizationHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            logger.warn("Invalid bearer token while fetching quiz id: {}", quizId);
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<String> roles = jwtService.extractRoles(token);
        boolean isStudent = roles.contains("STUDENT");
        boolean canBypassBatchCheck = roles.contains("TEACHER") || roles.contains("ADMIN");
        if (!isStudent && !canBypassBatchCheck) {
            logger.warn("User is not allowed to fetch quiz questions. Roles found: {}", roles);
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Optional<quizObj> quizOpt = quizRepo.findById(quizId);
        if (quizOpt.isEmpty()) {
            logger.warn("Quiz not found for id: {}", quizId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        quizObj quiz = quizOpt.get();

        if (isStudent && !canBypassBatchCheck) {
            logger.info("Allowing authenticated student to open quiz id: {}", quizId);
        }

        List<Integer> questionIds = quiz.getQuestionIds();
        ResponseEntity<List<QuestionWrapper>> questions = quizInterface.getQuestionsByIds(questionIds);
        return questions;
    }

    @Transactional
    public ResponseEntity<String> buildQuiz(quizObj quiz, Set<QuestionObj> aiquestions) {
        logger.info("Building quiz with AI questions");
        String ret = "";
        Set<Integer> newQuestions = new HashSet<>();
        for (QuestionObj q : aiquestions) {
            Integer questionId = quizInterface.addQuestioninDB(q).getBody();
            newQuestions.add(questionId);
        }
        if (!newQuestions.isEmpty()) ret += newQuestions.size() + " AI Question Added and ";
        if (quiz.getQuestionIds() == null) {
            quiz.setQuestionIds(new ArrayList<>());
        }
        quiz.getQuestionIds().addAll(newQuestions);
        quizObj savedQuiz = quizRepo.save(quiz);
        createQuizCreatedOutboxEvent(savedQuiz, "FINALIZE");
        ret+="Quiz: "+quiz.getTitle()+" has been created with "+quiz.getQuestionIds().size()+" questions";
        return new ResponseEntity<>(ret,HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<Integer> getCorrectAnswers(ResponseObj responseObj) {
        ResponseEntity<Integer> score = quizInterface.getScores(responseObj.getUserResponses());
        Integer actualScore = score.getBody();
//        List<QuizHistory> history = new ArrayList<>();
        List<answerHistory> answerObj=new ArrayList<>();
        for(userQuizObj response : responseObj.getUserResponses()) {
            QuestionObj ques= quizInterface.getQuestionById(response.getQuesId()).getBody();
            assert ques != null;
            answerHistory h=new answerHistory(ques.getQuestion(),response.getResponse(),ques.getAnswer());
            answerObj.add(h);
        }
        QuizHistory quizHistory = new QuizHistory(responseObj.getQuizId(),responseObj.getUsername(),actualScore,answerObj);
        quizHistoryRepo.save(quizHistory);
        createQuizSubmittedOutboxEvent(responseObj, actualScore);
        return score;
    }


    public ResponseEntity<List<QuestionWrapper>> getQuizQuestionsfromDB(String category) {
        List<Integer> questionIds= quizInterface.getQuestionsForQuiz(category).getBody();
        return quizInterface.getQuestionsByIds(questionIds);

    }

    public ResponseEntity<List<QuizDto>> getAllQuizesForABatch(String batch) {
        List<quizObj> quizzes = quizRepo.findByBatchIdsContaining(batch);
        if (quizzes.isEmpty()) {
            quizzes = quizRepo.findAll().stream()
                    .filter(quiz -> quiz.getBatchIds() != null && quiz.getBatchIds().stream().anyMatch(quizBatch -> batchMatches(quizBatch, batch)))
                    .toList();
        }



        if (quizzes.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<QuizDto> quizDtos=new ArrayList<>();
        for (quizObj quizObj: quizzes) {

            quizDtos.add(new QuizDto(quizObj.getTitle(),quizObj.getCategory(),quizObj.getId()));
        }
        System.out.println(quizDtos + " quizzes"+quizzes);
//
//        // Convert to DTOs
//        List<QuizDto> quizDtos = quizzes.stream()
//                .map(quiz -> new QuizDto(quiz.getTitle(), quiz.getCategory()))
//                .collect(Collectors.toList());

        return ResponseEntity.ok(quizDtos);
    }

    public ResponseEntity<List<QuizHistoryDto>> getQuizHistory(String authorizationHeader, String searchUsername, String batch) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String token = authorizationHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<String> roles = jwtService.extractRoles(token);
        String tokenUsername = jwtService.extractUsername(token);
        boolean isStudent = roles.contains("STUDENT");
        boolean canSearchAll = roles.contains("TEACHER") || roles.contains("ADMIN");
        if (!isStudent && !canSearchAll) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        String targetUsername = isStudent ? tokenUsername : normalizeBlank(searchUsername);
        String targetBatch = normalizeBlank(batch);
        if (targetBatch == null && targetUsername != null) {
            targetBatch = getBatchForUser(authorizationHeader, targetUsername);
        }
        if (isStudent && targetBatch == null) {
            targetBatch = getBatchForUser(authorizationHeader, tokenUsername);
        }

        String selectedBatch = targetBatch;
        List<quizObj> quizzes = selectedBatch == null
                ? quizRepo.findAll()
                : quizRepo.findAll().stream()
                .filter(quiz -> quiz.getBatchIds() != null && quiz.getBatchIds().stream().anyMatch(quizBatch -> batchMatches(quizBatch, selectedBatch)))
                .toList();

        List<String> targetUsernames = new ArrayList<>();
        if (targetUsername != null) {
            targetUsernames.add(targetUsername);
        } else if (canSearchAll && selectedBatch != null) {
            targetUsernames.addAll(getStudentsForBatch(authorizationHeader, selectedBatch));
        }

        List<QuizHistoryDto> rows = new ArrayList<>();
        for (quizObj quiz : quizzes) {
            if (!targetUsernames.isEmpty()) {
                for (String username : targetUsernames) {
                    QuizHistory history = quizHistoryRepo.findByQuizIdAndUsername(quiz.getId(), username).orElse(null);
                    rows.add(toQuizHistoryDto(quiz, username, history));
                }
            } else if (targetUsername != null) {
                QuizHistory history = quizHistoryRepo.findByQuizIdAndUsername(quiz.getId(), targetUsername).orElse(null);
                rows.add(toQuizHistoryDto(quiz, targetUsername, history));
            } else {
                List<QuizHistory> histories = quizHistoryRepo.findByQuizId(quiz.getId());
                if (histories.isEmpty()) {
                    rows.add(toQuizHistoryDto(quiz, null, null));
                } else {
                    for (QuizHistory history : histories) {
                        rows.add(toQuizHistoryDto(quiz, history.getUsername(), history));
                    }
                }
            }
        }

        return ResponseEntity.ok(rows);
    }

    public ResponseEntity<List<QuestionObj>> getAiGeneratedQuestions(String category, String level) {

        String prompt = String.format("""
    Generate 10 multiple choice questions in JSON format with the following fields:
    category, question, answer, difficultylevel, option1, option2, option3, option4.

    Ensure the answer matches one of the options.
    Use category as "%s" and difficulty level as "%s and give me pure json string not explainatory text and dont include any other things accept array not even ```json".
    """, category, level);
       String response = chatModel.call(prompt);
        System.out.println(response+"response");
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<QuestionObj> questions = objectMapper.readValue(response, new TypeReference<List<QuestionObj>>() {});
            // use questions
            System.out.println(questions+"questions");
            return new ResponseEntity<List<QuestionObj>>(questions,HttpStatus.OK);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ResponseEntity<List<QuestionObj>>(new ArrayList<>(),HttpStatus.OK);
            // handle error
        }

    }

    private void createQuizCreatedOutboxEvent(quizObj quiz, String sourceAction) {
        List<String> batchIds = quiz.getBatchIds() == null ? Collections.emptyList() : quiz.getBatchIds();
        int questionCount = quiz.getQuestionIds() == null ? 0 : quiz.getQuestionIds().size();
        QuizCreatedEvent event = new QuizCreatedEvent(
                "QUIZ_CREATED",
                quiz.getId(),
                quiz.getTitle(),
                quiz.getCategory(),
                batchIds,
                questionCount,
                sourceAction,
                "New quiz " + quiz.getTitle() + " is available",
                LocalDateTime.now()
        );

        outboxEventService.createEvent("QUIZ_CREATED", quizCreatedTopic, String.valueOf(quiz.getId()), event);
    }

    private void createQuizSubmittedOutboxEvent(ResponseObj responseObj, Integer actualScore) {
        QuizSubmittedEvent event = new QuizSubmittedEvent(
                "QUIZ_SUBMITTED",
                responseObj.getQuizId(),
                responseObj.getUsername(),
                actualScore,
                responseObj.getUsername() + " submitted quiz " + responseObj.getQuizId(),
                LocalDateTime.now()
        );

        outboxEventService.createEvent("QUIZ_SUBMITTED", quizSubmittedTopic, String.valueOf(responseObj.getQuizId()), event);
    }

    private boolean batchMatches(String quizBatch, String studentBatch) {
        return normalizeBatch(quizBatch).equals(normalizeBatch(studentBatch));
    }

    private String normalizeBatch(String batch) {
        return batch == null ? "" : batch.trim().toLowerCase();
    }

    private String normalizeBlank(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String getBatchForUser(String authorizationHeader, String username) {
        try {
            ResponseEntity<String> batchResponse = userInterface.getBatchByUsername(authorizationHeader, username);
            String userBatch = batchResponse.getBody();
            if (batchResponse.getStatusCode().is2xxSuccessful() && userBatch != null && !userBatch.isBlank()) {
                return userBatch.trim();
            }
        } catch (Exception ignored) {
            // Search remains usable with explicit batch even when user lookup is unavailable.
        }
        return null;
    }

    private List<String> getStudentsForBatch(String authorizationHeader, String batch) {
        try {
            ResponseEntity<List<String>> studentsResponse = userInterface.getStudentsByBatch(authorizationHeader, batch);
            List<String> students = studentsResponse.getBody();
            if (studentsResponse.getStatusCode().is2xxSuccessful() && students != null) {
                return students;
            }
        } catch (Exception ignored) {
            // Fall back below for seeded demo users.
        }
        String normalizedBatch = normalizeBatch(batch);
        if ("1".equals(normalizedBatch)) {
            return List.of("student1", "student2");
        }
        if ("2".equals(normalizedBatch)) {
            return List.of("student3");
        }
        return Collections.emptyList();
    }

    private QuizHistoryDto toQuizHistoryDto(quizObj quiz, String username, QuizHistory history) {
        return new QuizHistoryDto(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getCategory(),
                quiz.getBatchIds(),
                username,
                history != null,
                history == null ? null : history.getScore()
        );
    }
}
