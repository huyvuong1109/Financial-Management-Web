package notification_service.notification_service.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;
import notification_service.notification_service.event.BudgetAlertEvent;
import notification_service.notification_service.service.NotificationService;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetAlertListener {

    private final NotificationService notificationService;

    @JmsListener(destination = "budget-alert-queue")
    public void handleBudgetAlert(BudgetAlertEvent event) {
        try {
            log.info("Received budget alert event for budget: {}", event.getBudgetId());

            // Get user email (you'll need to fetch this from account service)
            String emailSubject = "Budget Alert - " + event.getCategoryName();
            
            String emailBody = buildEmailBody(event);

            // Send email
            notificationService.sendNotification(
                event.getAccountId(),
                emailSubject,
                emailBody,
                "EMAIL"
            );

            log.info("Budget alert notification sent for budget: {}", event.getBudgetId());

        } catch (Exception e) {
            log.error("Error handling budget alert", e);
        }
    }

    private String buildEmailBody(BudgetAlertEvent event) {
        StringBuilder body = new StringBuilder();
        body.append("Budget Alert Notification\n\n");
        body.append("Category: ").append(event.getCategoryName()).append("\n");
        body.append("Month: ").append(event.getMonthYear()).append("\n");
        body.append("Budget Amount: ").append(event.getBudgetAmount()).append(" VND\n");
        body.append("Already Spent: ").append(event.getSpent()).append(" VND\n");
        body.append("Spending Percentage: ").append(event.getSpendingPercentage()).append("%\n");
        body.append("Alert Threshold: ").append(event.getAlertThreshold()).append("%\n");

        if (event.getExceeded()) {
            body.append("\n⚠️ WARNING: You have EXCEEDED your budget limit!\n");
            body.append("Amount over: ").append(event.getSpent().subtract(event.getBudgetAmount())).append(" VND");
        } else {
            body.append("\n⚠️ WARNING: You are approaching your budget limit!\n");
        }

        return body.toString();
    }
}
