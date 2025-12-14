package notification_service.notification_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import notification_service.notification_service.model.Notification;
import notification_service.notification_service.repository.NotificationRepository;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    @GetMapping("/received/{userId}")
    public ResponseEntity<List<Notification>> getReceivedNotificationsByUserId(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByToAccountIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> {
            notification.setFromAccountId(null); // Ẩn thông tin tài khoản gửi
            notification.setToAccountId(null);   // Ẩn thông tin tài khoản nhận
        });
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<Notification>> getSentNotificationsByUserId(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByFromAccountIdOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> {
            notification.setFromAccountId(null); // Ẩn thông tin tài khoản gửi
            notification.setToAccountId(null);   // Ẩn thông tin tài khoản nhận
        });
        return ResponseEntity.ok(notifications);
    }
}