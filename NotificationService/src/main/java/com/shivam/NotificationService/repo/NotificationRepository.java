package com.shivam.NotificationService.repo;

import com.shivam.NotificationService.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByNotificationStatusOrderByCreatedAtDesc(String notificationStatus);

    List<Notification> findByRecipientIdentifierOrderByCreatedAtDesc(String recipientIdentifier);

    List<Notification> findByRecipientIdentifierInOrderByCreatedAtDesc(List<String> recipientIdentifiers);

    List<Notification> findByRecipientTypeIgnoreCaseOrderByCreatedAtDesc(String recipientType);
}
