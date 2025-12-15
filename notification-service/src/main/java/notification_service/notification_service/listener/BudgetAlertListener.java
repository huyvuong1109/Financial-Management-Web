package notification_service.notification_service.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import notification_service.notification_service.dto.BudgetAlertMessage;
import notification_service.notification_service.model.BudgetAlert;
import notification_service.notification_service.repository.BudgetAlertRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final BudgetAlertRepository budgetAlertRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @JmsListener(destination = "budget-alert-queue")
    public void onBudgetAlert(String messageJson) {
        try {
            BudgetAlertMessage msg = objectMapper.readValue(messageJson, BudgetAlertMessage.class);
            log.info("Received budget alert: {}", msg);

            boolean emailSent = false;

            // Gửi email nếu có email
            if (msg.accountEmail() != null && !msg.accountEmail().isEmpty() && !fromEmail.isEmpty()) {
                try {
                    sendAlertEmail(msg);
                    emailSent = true;
                    log.info("Email sent to {} for budget alert", msg.accountEmail());
                } catch (Exception e) {
                    log.error("Failed to send email for budget alert: {}", e.getMessage());
                }
            }

            // Lưu vào database
            BudgetAlert alert = BudgetAlert.builder()
                    .budgetId(msg.budgetId())
                    .accountId(msg.accountId())
                    .accountEmail(msg.accountEmail())
                    .categoryId(msg.categoryId())
                    .categoryName(msg.categoryName())
                    .budgetMonth(msg.budgetMonth())
                    .budgetYear(msg.budgetYear())
                    .budgetAmount(msg.budgetAmount())
                    .spentAmount(msg.spentAmount())
                    .progressPercent(msg.progressPercent())
                    .alertType(msg.alertType())
                    .message(msg.message())
                    .emailSent(emailSent)
                    .build();

            budgetAlertRepository.save(alert);
            log.info("Budget alert saved to database: {}", alert.getId());

            // Gửi thông báo real-time qua WebSocket
            messagingTemplate.convertAndSend("/topic/budget-alerts/" + msg.accountId(), msg);
            log.info("WebSocket notification sent for account: {}", msg.accountId());

        } catch (Exception e) {
            log.error("Failed to process budget alert message: {}", e.getMessage(), e);
        }
    }

    private void sendAlertEmail(BudgetAlertMessage msg) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(msg.accountEmail());
        
        String subject;
        if ("EXCEEDED".equals(msg.alertType())) {
            subject = "⚠️ CẢNH BÁO: Đã vượt ngân sách tháng " + msg.budgetMonth() + "/" + msg.budgetYear();
        } else {
            subject = "⚠️ Thông báo: Sắp vượt ngân sách tháng " + msg.budgetMonth() + "/" + msg.budgetYear();
        }
        
        String body = String.format("""
                Xin chào,
                
                %s
                
                Chi tiết:
                - Danh mục: %s
                - Ngân sách: %,.0f VND
                - Đã chi tiêu: %,.0f VND
                - Tiến độ: %.1f%%
                - Tháng: %d/%d
                
                Vui lòng kiểm tra lại chi tiêu của bạn.
                
                Trân trọng,
                Hệ thống Quản lý Tài chính
                """,
                msg.message(),
                msg.categoryName() != null ? msg.categoryName() : "Tổng chi tiêu",
                msg.budgetAmount(),
                msg.spentAmount(),
                msg.progressPercent(),
                msg.budgetMonth(),
                msg.budgetYear()
        );
        
        message.setSubject(subject);
        message.setText(body);
        
        mailSender.send(message);
    }
}
