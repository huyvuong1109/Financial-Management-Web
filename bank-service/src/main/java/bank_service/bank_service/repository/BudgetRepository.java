package bank_service.bank_service.repository;

import bank_service.bank_service.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find budget by accountId, categoryId, and monthYear
     */
    Optional<Budget> findByAccountIdAndCategoryIdAndMonthYear(
            String accountId, Long categoryId, String monthYear
    );

    /**
     * Find all budgets for a specific account
     */
    List<Budget> findByAccountId(String accountId);

    /**
     * Find all budgets for a specific account in a specific month
     */
    List<Budget> findByAccountIdAndMonthYear(String accountId, String monthYear);

    /**
     * Find all budgets for a specific account and category
     */
    List<Budget> findByAccountIdAndCategoryId(String accountId, Long categoryId);

    /**
     * Find budgets that should trigger alert (not yet alerted and threshold reached)
     */
    @Query("SELECT b FROM Budget b WHERE b.accountId = :accountId AND b.alertSent = false " +
            "AND (b.spent * 100 / b.budgetAmount) >= b.alertThreshold")
    List<Budget> findBudgetsNeedingAlert(@Param("accountId") String accountId);
}
