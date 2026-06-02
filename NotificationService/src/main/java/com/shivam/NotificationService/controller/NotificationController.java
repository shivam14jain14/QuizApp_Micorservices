package com.shivam.NotificationService.controller;

import com.shivam.NotificationService.dto.NotificationDetail;
import com.shivam.NotificationService.dto.NotificationSummary;
import com.shivam.NotificationService.model.Notification;
import com.shivam.NotificationService.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationSummary> getNotifications(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return notificationService.getNotificationSummariesForToken(authorizationHeader);
    }

    @GetMapping("/read/{id}")
    public NotificationDetail readNotification(@PathVariable Long id,
                                               @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return notificationService.markNotificationAsRead(id, authorizationHeader);
    }

    @GetMapping("/unread/{id}")
    public NotificationDetail unreadNotification(@PathVariable Long id,
                                                 @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return notificationService.markNotificationAsUnread(id, authorizationHeader);
    }

    @GetMapping("/sent")
    public List<Notification> getSentNotifications(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return notificationService.getSentNotificationsForAdmin(authorizationHeader);
    }

    @GetMapping("/failed")
    public List<Notification> getFailedNotifications(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return notificationService.getFailedNotificationsForAdmin(authorizationHeader);
    }

    @GetMapping("/recipient/{recipientIdentifier}")
    public List<Notification> getNotificationsForRecipient(@PathVariable String recipientIdentifier,
                                                           @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return notificationService.getNotificationsForRecipientAsAdmin(recipientIdentifier, authorizationHeader);
    }
}
