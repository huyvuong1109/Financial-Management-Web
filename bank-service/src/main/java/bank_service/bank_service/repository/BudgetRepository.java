package bank_service.bank_service.repository;

import bank_service.bank_service.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {

    // Lấy tất cả budget của một account trong tháng
    List<Budget> findByAccountIdAndBudgetMonthAndBudgetYear(
            String accountId, Integer budgetMonth, Integer budgetYear);

    // Lấy tất cả budget của một account
    List<Budget> findByAccountIdOrderByBudgetYearDescBudgetMonthDesc(String accountId);

    // Lấy budget theo account, category và tháng
    Optional<Budget> findByAccountIdAndCategoryIdAndBudgetMonthAndBudgetYear(
            String accountId, String categoryId, Integer budgetMonth, Integer budgetYear);

    // Lấy budget tổng (không có category) theo account và tháng
    @Query("SELECT b FROM Budget b WHERE b.accountId = :accountId " +
           "AND b.categoryId IS NULL " +
           "AND b.budgetMonth = :month AND b.budgetYear = :year")
    Optional<Budget> findTotalBudgetByAccountAndMonth(
            @Param("accountId") String accountId,
            @Param("month") Integer month,
            @Param("year") Integer year);

    // Lấy tất cả budget cần kiểm tra alert (alertSent = false hoặc exceededAlertSent = false)
    @Query("SELECT b FROM Budget b WHERE b.budgetMonth = :month AND b.budgetYear = :year " +
           "AND (b.alertSent = false OR b.exceededAlertSent = false)")
    List<Budget> findBudgetsNeedingAlertCheck(
            @Param("month") Integer month,
            @Param("year") Integer year);

    // Đếm số budget theo account
    int countByAccountId(String accountId);

    // Xóa tất cả budget của account theo tháng
    void deleteByAccountIdAndBudgetMonthAndBudgetYear(
            String accountId, Integer budgetMonth, Integer budgetYear);
}
