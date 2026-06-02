package com.shivam.userapigateway.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shivam.userapigateway.model.OutboxEvent;
import com.shivam.userapigateway.repo.OutboxEventRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OutboxEventService {
    private static final Logger logger = LoggerFactory.getLogger(OutboxEventService.class);

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
        OutboxEvent savedEvent = outboxEventRepo.saveAndFlush(event);
        logger.info("Created outbox event id: {} type: {} topic: {} key: {}",
                savedEvent.getId(), savedEvent.getEventType(), savedEvent.getTopic(), savedEvent.getEventKey());
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Unable to serialize outbox event payload", e);
        }
    }
}
