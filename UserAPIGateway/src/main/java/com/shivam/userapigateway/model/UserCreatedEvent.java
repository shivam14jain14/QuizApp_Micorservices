package com.shivam.userapigateway.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserCreatedEvent {
    private String eventType;
    private String username;
    private String requestedRole;
    private String message;
    private LocalDateTime createdAt;

    public UserCreatedEvent(String eventType, String username, String requestedRole, String message, LocalDateTime createdAt) {
        this.eventType = eventType;
        this.username = username;
        this.requestedRole = requestedRole;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getEventType() {
        return eventType;
    }

    public String getUsername() {
        return username;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
