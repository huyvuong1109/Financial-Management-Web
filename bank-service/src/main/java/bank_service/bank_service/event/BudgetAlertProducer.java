package bank_service.bank_service.event;

import bank_service.bank_service.model.Budget;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class BudgetAlertProducer {

    private final JmsTemplate jmsTemplate;

    private static final String BUDGET_ALERT_QUEUE = "budget-alert-queue";

    public void sendBudgetAlert(Budget budget) {
        try {
            // Get category name from the budget (need to retrieve it from service)
            BudgetAlertEvent event = BudgetAlertEvent.builder()
                    .budgetId(budget.getBudgetId())
                    .accountId(budget.getAccountId())
                    .monthYear(budget.getMonthYear())
                    .budgetAmount(budget.getBudgetAmount())
                    .spent(budget.getSpent())
                    .spendingPercentage(budget.getSpendingPercentage())
                    .alertThreshold(budget.getAlertThreshold())
                    .exceeded(budget.isExceeded())
                    .timestamp(LocalDateTime.now())
                    .build();

            jmsTemplate.convertAndSend(BUDGET_ALERT_QUEUE, event);

            log.info("Budget alert sent to queue for budget: {}", budget.getBudgetId());
        } catch (Exception e) {
            log.error("Error sending budget alert for budget: {}", budget.getBudgetId(), e);
        }
    }
}
