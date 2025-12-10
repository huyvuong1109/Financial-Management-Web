package bank_service.bank_service.repository;

import bank_service.bank_service.model.SavingsGoal;
import bank_service.bank_service.model.SavingsGoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    
    List<SavingsGoal> findByAccountId(String accountId);
    
    List<SavingsGoal> findByAccountIdAndStatus(String accountId, SavingsGoalStatus status);
    
    @Query("SELECT COALESCE(SUM(s.currentAmount), 0) FROM SavingsGoal s WHERE s.accountId = :accountId AND s.status = 'ACTIVE'")
    BigDecimal getTotalSavingsByAccountId(@Param("accountId") String accountId);
    
    @Query("SELECT COUNT(s) FROM SavingsGoal s WHERE s.accountId = :accountId AND s.status = 'ACTIVE'")
    Long countActiveSavingsByAccountId(@Param("accountId") String accountId);
}
