package com.shivam.NotificationService.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedEvent {
    private String eventType;
    private String username;
    private String requestedRole;
    private String message;
    private LocalDateTime createdAt;
}
