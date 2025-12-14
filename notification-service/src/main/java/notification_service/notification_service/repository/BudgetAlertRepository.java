package notification_service.notification_service.repository;

import notification_service.notification_service.model.BudgetAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, String> {
    
    List<BudgetAlert> findByAccountIdOrderByCreatedAtDesc(String accountId);
    
    List<BudgetAlert> findByAccountIdAndBudgetMonthAndBudgetYearOrderByCreatedAtDesc(
            String accountId, Integer budgetMonth, Integer budgetYear);
    
    List<BudgetAlert> findByBudgetIdOrderByCreatedAtDesc(String budgetId);
}
