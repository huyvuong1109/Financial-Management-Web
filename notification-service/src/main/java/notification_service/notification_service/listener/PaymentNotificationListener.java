package notification_service.notification_service.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import notification_service.notification_service.repository.NotificationRepository;
import notification_service.notification_service.model.Notification;
import notification_service.notification_service.model.PaymentMessage;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentNotificationListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    private final NotificationRepository notificationRepository;

    @JmsListener(destination = "payment-queue")
    public void onMessage(String messageJson) {
        try {
            PaymentMessage msg = objectMapper.readValue(messageJson, PaymentMessage.class);

            Notification notificationToSave = Notification.builder()
                    .paymentId(msg.paymentId())
                    .fromAccountId(msg.fromAccountId())
                    .toAccountId(msg.toAccountId())
                    .fromCardId(msg.fromCardId()) // Lưu thẻ gửi
                    .toCardId(msg.toCardId())     // Lưu thẻ nhận
                    .amount(msg.amount())
                    .build();

            // Lưu vào database
            notificationRepository.save(notificationToSave);
            System.out.println("Notification saved to database for paymentId: " + msg.paymentId());

            // Gửi thông báo tới client qua WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", msg);

            System.out.println("Payment confirmed & notification sent for paymentId: " + msg.paymentId() + ", amount: " + msg.amount());
        } catch (Exception e) {
            System.err.println("Failed to process and save message: " + e.getMessage());
        }
    }
}
