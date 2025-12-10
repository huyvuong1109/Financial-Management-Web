package bank_service.bank_service.repository;

import bank_service.bank_service.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    List<Budget> findByAccountId(String accountId);
    
    List<Budget> findByAccountIdAndYearAndMonth(String accountId, Integer year, Integer month);
    
    Optional<Budget> findByAccountIdAndCategoryIdAndYearAndMonth(
        String accountId, Long categoryId, Integer year, Integer month);
    
    @Query("SELECT b FROM Budget b WHERE b.accountId = :accountId AND b.year = :year AND b.month = :month")
    List<Budget> findBudgetsByMonth(
        @Param("accountId") String accountId, 
        @Param("year") Integer year, 
        @Param("month") Integer month);
}
