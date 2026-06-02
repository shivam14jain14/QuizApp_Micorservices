package com.shivam.NotificationService.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shivam.NotificationService.model.QuizCreatedEvent;
import com.shivam.NotificationService.model.QuizSubmittedEvent;
import com.shivam.NotificationService.model.UserCreatedEvent;
import com.shivam.NotificationService.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {
    private static final Logger logger = LoggerFactory.getLogger(NotificationEventListener.class);

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public NotificationEventListener(ObjectMapper objectMapper, NotificationService notificationService) {
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "${app.kafka.topic.quiz-created}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleQuizCreated(String payload) {
        String topic = "quiz-created-notifications";
        try {
            QuizCreatedEvent event = objectMapper.readValue(payload, QuizCreatedEvent.class);
            notificationService.saveQuizCreatedNotifications(event, topic, payload);
            logger.info("Stored quiz created notifications for quiz id: {}", event.getQuizId());
        } catch (Exception exception) {
            logger.warn("Failed to process quiz created event", exception);
            notificationService.saveFailedNotification("QUIZ_CREATED", topic, null, payload, exception);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.quiz-submitted}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleQuizSubmitted(String payload) {
        String topic = "quiz-submitted-notifications";
        try {
            QuizSubmittedEvent event = objectMapper.readValue(payload, QuizSubmittedEvent.class);
            notificationService.saveQuizSubmittedNotification(event, topic, payload);
            logger.info("Stored quiz submitted notification for quiz id: {}", event.getQuizId());
        } catch (Exception exception) {
            logger.warn("Failed to process quiz submitted event", exception);
            notificationService.saveFailedNotification("QUIZ_SUBMITTED", topic, null, payload, exception);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.user-created}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleUserCreated(String payload) {
        String topic = "user-created-notifications";
        try {
            UserCreatedEvent event = objectMapper.readValue(payload, UserCreatedEvent.class);
            notificationService.saveUserCreatedNotification(event, topic, payload);
            logger.info("Stored user created notification for username: {}", event.getUsername());
        } catch (Exception exception) {
            logger.warn("Failed to process user created event", exception);
            notificationService.saveFailedNotification("USER_CREATED", topic, null, payload, exception);
        }
    }
}
