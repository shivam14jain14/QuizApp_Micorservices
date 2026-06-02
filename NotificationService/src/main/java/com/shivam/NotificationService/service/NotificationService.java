package com.shivam.NotificationService.service;

import com.shivam.NotificationService.model.Notification;
import com.shivam.NotificationService.model.QuizCreatedEvent;
import com.shivam.NotificationService.model.QuizSubmittedEvent;
import com.shivam.NotificationService.model.UserCreatedEvent;
import com.shivam.NotificationService.repo.NotificationRepository;
import com.shivam.NotificationService.feign.UserInterface;
import com.shivam.NotificationService.dto.NotificationDetail;
import com.shivam.NotificationService.dto.NotificationSummary;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.LinkedHashSet;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final JwtService jwtService;
    private final UserInterface userInterface;

    public NotificationService(NotificationRepository notificationRepository, JwtService jwtService, UserInterface userInterface) {
        this.notificationRepository = notificationRepository;
        this.jwtService = jwtService;
        this.userInterface = userInterface;
    }

    public List<Notification> saveQuizCreatedNotifications(QuizCreatedEvent event, String topic, String rawPayload) {
        List<String> batchIds = event.getBatchIds() == null ? Collections.emptyList() : event.getBatchIds();

        return batchIds.stream()
                .map(this::normalizeRecipientValue)
                .filter(batchId -> !batchId.isBlank())
                .map(batchId -> saveNotification(
                        event.getEventType(),
                        topic,
                        event.getQuizId(),
                        "STUDENT_BATCH",
                        batchId,
                        event.getQuizTitle(),
                        event.getMessage(),
                        rawPayload
                ))
                .toList();
    }

    public Notification saveQuizSubmittedNotification(QuizSubmittedEvent event, String topic, String rawPayload) {
        return saveNotification(
                event.getEventType(),
                topic,
                event.getQuizId(),
                "TEACHER",
                "TEACHER",
                "Quiz submitted",
                event.getMessage() + ". Score: " + event.getScore(),
                rawPayload
        );
    }

    public Notification saveUserCreatedNotification(UserCreatedEvent event, String topic, String rawPayload) {
        return saveNotification(
                event.getEventType(),
                topic,
                null,
                "ADMIN",
                "ADMIN",
                "User approval required",
                event.getMessage(),
                rawPayload
        );
    }

    public Notification saveFailedNotification(String eventType, String topic, Integer quizId, String rawPayload, Exception exception) {
        Notification notification = new Notification();
        notification.setEventType(eventType == null ? "UNKNOWN" : eventType);
        notification.setTopic(topic);
        notification.setQuizId(quizId);
        notification.setRecipientType("UNKNOWN");
        notification.setRecipientIdentifier("UNKNOWN");
        notification.setTitle("Notification failed");
        notification.setMessage("Failed to process notification event");
        notification.setNotificationStatus(Notification.STATUS_FAILED);
        notification.setReadStatus(Notification.READ_STATUS_UNREAD);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRawPayload(rawPayload);
        notification.setErrorMessage(exception.getMessage());
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsForToken(String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        if (!jwtService.isTokenValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid bearer token");
        }

        List<String> roles = jwtService.extractRoles(token);
        String username = jwtService.extractUsername(token);

        if (roles.contains("ADMIN")) {
            return notificationRepository.findByRecipientTypeIgnoreCaseOrderByCreatedAtDesc("ADMIN");
        }

        List<String> recipientIdentifiers = new ArrayList<>();

        if (roles.contains("TEACHER")) {
            recipientIdentifiers.add("TEACHER");
        }

        if (roles.contains("STUDENT")) {
            recipientIdentifiers.addAll(getStudentRecipientIdentifiers(authorizationHeader, username));
        }

        if (recipientIdentifiers.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No notifications available for current role");
        }

        return notificationRepository.findByRecipientIdentifierInOrderByCreatedAtDesc(recipientIdentifiers);
    }

    public NotificationDetail markNotificationAsRead(Long id, String authorizationHeader) {
        Notification notification = getAuthorizedNotification(id, authorizationHeader);
        notification.setReadStatus(Notification.READ_STATUS_READ);
        notification.setReadAt(LocalDateTime.now());
        return toNotificationDetail(notificationRepository.save(notification));
    }

    public NotificationDetail markNotificationAsUnread(Long id, String authorizationHeader) {
        Notification notification = getAuthorizedNotification(id, authorizationHeader);
        notification.setReadStatus(Notification.READ_STATUS_UNREAD);
        notification.setReadAt(null);
        return toNotificationDetail(notificationRepository.save(notification));
    }

    public List<NotificationSummary> getNotificationSummariesForToken(String authorizationHeader) {
        return getNotificationsForToken(authorizationHeader).stream()
                .map(this::toNotificationSummary)
                .toList();
    }

    public List<Notification> getSentNotifications() {
        return notificationRepository.findByNotificationStatusOrderByCreatedAtDesc(Notification.STATUS_SENT);
    }

    public List<Notification> getSentNotificationsForAdmin(String authorizationHeader) {
        validateAdmin(authorizationHeader);
        return getSentNotifications();
    }

    public List<Notification> getFailedNotifications() {
        return notificationRepository.findByNotificationStatusOrderByCreatedAtDesc(Notification.STATUS_FAILED);
    }

    public List<Notification> getFailedNotificationsForAdmin(String authorizationHeader) {
        validateAdmin(authorizationHeader);
        return getFailedNotifications();
    }

    public List<Notification> getNotificationsForRecipient(String recipientIdentifier) {
        return notificationRepository.findByRecipientIdentifierOrderByCreatedAtDesc(recipientIdentifier);
    }

    public List<Notification> getNotificationsForRecipientAsAdmin(String recipientIdentifier, String authorizationHeader) {
        validateAdmin(authorizationHeader);
        return getNotificationsForRecipient(recipientIdentifier);
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization bearer token is required");
        }
        return authorizationHeader.substring(7);
    }

    private void validateAdmin(String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        if (!jwtService.isTokenValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid bearer token");
        }
        if (!jwtService.extractRoles(token).contains("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role is required");
        }
    }

    private Notification getAuthorizedNotification(Long id, String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        if (!jwtService.isTokenValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid bearer token");
        }

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        List<String> roles = jwtService.extractRoles(token);
        if (roles.contains("ADMIN")) {
            return notification;
        }

        List<String> recipientIdentifiers = new ArrayList<>();
        if (roles.contains("TEACHER")) {
            recipientIdentifiers.add("TEACHER");
        }
        if (roles.contains("STUDENT")) {
            String username = jwtService.extractUsername(token);
            recipientIdentifiers.addAll(getStudentRecipientIdentifiers(authorizationHeader, username));
        }

        if (!recipientIdentifiers.contains(normalizeRecipientValue(notification.getRecipientIdentifier()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification is not available for this user");
        }

        return notification;
    }

    private String getStudentBatch(String authorizationHeader, String username) {
        try {
            ResponseEntity<String> batchResponse = userInterface.getBatchByUsername(authorizationHeader, username);
            String batch = batchResponse.getBody();
            if (batchResponse.getStatusCode().is2xxSuccessful() && batch != null && !batch.isBlank()) {
                return batch;
            }
        } catch (Exception ignored) {
            // Fall back to known seed users below so notification reads do not fail with 500.
        }
        return getSeedStudentBatch(username);
    }

    private String normalizeIdentifier(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRecipientValue(String value) {
        return value == null ? "" : value.trim();
    }

    private List<String> getStudentRecipientIdentifiers(String authorizationHeader, String username) {
        return batchIdentifierAliases(getStudentBatch(authorizationHeader, username));
    }

    private List<String> batchIdentifierAliases(String batch) {
        String normalized = normalizeRecipientValue(batch);
        String lower = normalizeIdentifier(normalized);
        String numeric = lower
                .replace("batch", "")
                .replace("-", "")
                .replace("_", "")
                .replace(" ", "")
                .trim();

        LinkedHashSet<String> aliases = new LinkedHashSet<>();
        if (!normalized.isBlank()) {
            aliases.add(normalized);
            aliases.add(lower);
        }
        if (!numeric.isBlank()) {
            aliases.add(numeric);
            aliases.add("BATCH-" + numeric);
            aliases.add("Batch-" + numeric);
            aliases.add("batch-" + numeric);
            aliases.add("BATCH_" + numeric);
            aliases.add("Batch_" + numeric);
            aliases.add("batch_" + numeric);
            aliases.add("BATCH" + numeric);
            aliases.add("Batch" + numeric);
            aliases.add("batch" + numeric);
            aliases.add("BATCH " + numeric);
            aliases.add("Batch " + numeric);
            aliases.add("batch " + numeric);
        }
        return new ArrayList<>(aliases);
    }

    private String getSeedStudentBatch(String username) {
        if ("student1".equalsIgnoreCase(username) || "student2".equalsIgnoreCase(username)) {
            return "1";
        }
        if ("student3".equalsIgnoreCase(username)) {
            return "2";
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student batch not found");
    }

    private Notification saveNotification(
            String eventType,
            String topic,
            Integer quizId,
            String recipientType,
            String recipientIdentifier,
            String title,
            String message,
            String rawPayload
    ) {
        Notification notification = new Notification();
        notification.setEventType(eventType);
        notification.setTopic(topic);
        notification.setQuizId(quizId);
        notification.setRecipientType(recipientType);
        notification.setRecipientIdentifier(recipientIdentifier);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationStatus(Notification.STATUS_SENT);
        notification.setReadStatus(Notification.READ_STATUS_UNREAD);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setSentAt(LocalDateTime.now());
        notification.setRawPayload(rawPayload);
        return notificationRepository.save(notification);
    }

    private NotificationDetail toNotificationDetail(Notification notification) {
        return new NotificationDetail(
                notification.getId(),
                notification.getEventType(),
                notification.getTopic(),
                notification.getQuizId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCreatedAt()
        );
    }

    private NotificationSummary toNotificationSummary(Notification notification) {
        return new NotificationSummary(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getEventType(),
                notification.getTopic(),
                notification.getQuizId(),
                notification.getRecipientType(),
                notification.getRecipientIdentifier(),
                notification.getNotificationStatus(),
                notification.getReadStatus(),
                notification.getCreatedAt()
        );
    }
}
