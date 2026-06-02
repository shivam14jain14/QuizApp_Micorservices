package com.shivam.MicroserviceQuizService.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shivam.MicroserviceQuizService.model.OutboxEvent;
import com.shivam.MicroserviceQuizService.repo.OutboxEventRepo;
import org.springframework.stereotype.Service;

@Service
public class OutboxEventService {
    private final OutboxEventRepo outboxEventRepo;
    private final ObjectMapper objectMapper;

    public OutboxEventService(OutboxEventRepo outboxEventRepo, ObjectMapper objectMapper) {
        this.outboxEventRepo = outboxEventRepo;
        this.objectMapper = objectMapper;
    }

    public void createEvent(String eventType, String topic, String eventKey, Object payload) {
        OutboxEvent event = new OutboxEvent();
        event.setEventType(eventType);
        event.setTopic(topic);
        event.setEventKey(eventKey);
        event.setPayload(toJson(payload));
        event.setStatus(OutboxEvent.STATUS_PENDING);
        outboxEventRepo.save(event);
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Unable to serialize outbox event payload", e);
        }
    }
}
