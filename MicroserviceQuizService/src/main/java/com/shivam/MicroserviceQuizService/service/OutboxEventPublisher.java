package com.shivam.MicroserviceQuizService.service;

import com.shivam.MicroserviceQuizService.model.OutboxEvent;
import com.shivam.MicroserviceQuizService.repo.OutboxEventRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class OutboxEventPublisher {
    private static final Logger logger = LoggerFactory.getLogger(OutboxEventPublisher.class);

    private final OutboxEventRepo outboxEventRepo;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${app.outbox.publisher.max-attempts:10}")
    private int maxAttempts;

    public OutboxEventPublisher(OutboxEventRepo outboxEventRepo, KafkaTemplate<String, String> kafkaTemplate) {
        this.outboxEventRepo = outboxEventRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelayString = "${app.outbox.publisher.fixed-delay-ms:5000}")
    public void publishPendingEvents() {
        List<OutboxEvent> events = outboxEventRepo.findTop50ByStatusInOrderByCreatedAtAsc(
                List.of(OutboxEvent.STATUS_PENDING, OutboxEvent.STATUS_FAILED)
        );

        for (OutboxEvent event : events) {
            if (event.getRetryCount() >= maxAttempts) {
                continue;
            }
            publish(event);
        }
    }

    private void publish(OutboxEvent event) {
        event.setLastAttemptAt(LocalDateTime.now());
        event.setRetryCount(event.getRetryCount() + 1);

        try {
            kafkaTemplate.send(event.getTopic(), event.getEventKey(), event.getPayload()).get(10, TimeUnit.SECONDS);
            event.setStatus(OutboxEvent.STATUS_PUBLISHED);
            event.setPublishedAt(LocalDateTime.now());
            event.setLastError(null);
            logger.info("Published outbox event id: {} type: {} topic: {}", event.getId(), event.getEventType(), event.getTopic());
        } catch (Exception ex) {
            event.setStatus(OutboxEvent.STATUS_FAILED);
            event.setLastError(ex.getMessage());
            logger.warn("Failed to publish outbox event id: {} attempt: {}", event.getId(), event.getRetryCount(), ex);
        }

        outboxEventRepo.save(event);
    }
}
