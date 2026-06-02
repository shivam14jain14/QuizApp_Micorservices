package com.shivam.NotificationService.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {
    public static final String STATUS_SENT = "SENT";
    public static final String STATUS_FAILED = "FAILED";
    public static final String READ_STATUS_READ = "READ";
    public static final String READ_STATUS_UNREAD = "UNREAD";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventType;
    private String topic;
    private Integer quizId;
    private String recipientType;
    private String recipientIdentifier;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String notificationStatus;
    private String readStatus;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;

    @Column(columnDefinition = "TEXT")
    private String rawPayload;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    public void setDefaults() {
        if (readStatus == null) {
            readStatus = READ_STATUS_UNREAD;
        }
    }
}
