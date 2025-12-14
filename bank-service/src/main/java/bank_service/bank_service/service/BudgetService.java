package bank_service.bank_service.service;

import bank_service.bank_service.dto.*;
import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.Budget;
import bank_service.bank_service.model.Category;
import bank_service.bank_service.repository.BudgetRepository;
import bank_service.bank_service.repository.CategoryRepository;
import bank_service.bank_service.event.BudgetAlertProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetAlertProducer budgetAlertProducer;

    /**
     * Create a new budget
     */
    @Transactional
    public BudgetResponse createBudget(CreateBudgetRequest request) {
        log.info("Creating budget for account: {}, category: {}, month: {}", 
                request.getAccountId(), request.getCategoryId(), request.getMonthYear());

        // Validate monthYear format
        validateMonthYearFormat(request.getMonthYear());

        // Check if budget already exists
        budgetRepository.findByAccountIdAndCategoryIdAndMonthYear(
                request.getAccountId(), request.getCategoryId(), request.getMonthYear()
        ).ifPresent(b -> {
            throw new IllegalArgumentException(
                    "Budget already exists for this account, category and month"
            );
        });

        // Get category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("Category not found"));

        // Create budget
        Budget budget = Budget.builder()
                .accountId(request.getAccountId())
                .categoryId(request.getCategoryId())
                .monthYear(request.getMonthYear())
                .budgetAmount(request.getBudgetAmount())
                .alertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 80)
                .spent(BigDecimal.ZERO)
                .alertSent(false)
                .build();

        budget = budgetRepository.save(budget);

        return mapToBudgetResponse(budget, category.getCategoryName());
    }

    /**
     * Get budget by ID
     */
    public BudgetResponse getBudgetById(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        Category category = categoryRepository.findById(budget.getCategoryId())
                .orElseThrow(() -> new AppException("Category not found"));

        return mapToBudgetResponse(budget, category.getCategoryName());
    }

    /**
     * Get all budgets for an account
     */
    public List<BudgetResponse> getBudgetsByAccountId(String accountId) {
        List<Budget> budgets = budgetRepository.findByAccountId(accountId);

        return budgets.stream()
                .map(budget -> {
                    Category category = categoryRepository.findById(budget.getCategoryId())
                            .orElse(null);
                    String categoryName = category != null ? category.getCategoryName() : "Unknown";
                    return mapToBudgetResponse(budget, categoryName);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get budgets for a specific month
     */
    public List<BudgetResponse> getBudgetsByMonthYear(String accountId, String monthYear) {
        validateMonthYearFormat(monthYear);

        List<Budget> budgets = budgetRepository.findByAccountIdAndMonthYear(accountId, monthYear);

        return budgets.stream()
                .map(budget -> {
                    Category category = categoryRepository.findById(budget.getCategoryId())
                            .orElse(null);
                    String categoryName = category != null ? category.getCategoryName() : "Unknown";
                    return mapToBudgetResponse(budget, categoryName);
                })
                .collect(Collectors.toList());
    }

    /**
     * Update budget
     */
    @Transactional
    public BudgetResponse updateBudget(Long budgetId, UpdateBudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        if (request.getBudgetAmount() != null) {
            budget.setBudgetAmount(request.getBudgetAmount());
        }

        if (request.getAlertThreshold() != null) {
            budget.setAlertThreshold(request.getAlertThreshold());
        }

        budget = budgetRepository.save(budget);

        Category category = categoryRepository.findById(budget.getCategoryId())
                .orElseThrow(() -> new AppException("Category not found"));

        return mapToBudgetResponse(budget, category.getCategoryName());
    }

    /**
     * Delete budget
     */
    @Transactional
    public void deleteBudget(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        budgetRepository.delete(budget);
        log.info("Budget deleted: {}", budgetId);
    }

    /**
     * Update spending on a budget (called from TransactionService)
     */
    @Transactional
    public void recordSpending(String accountId, Long categoryId, String monthYear, BigDecimal amount) {
        log.info("Recording spending - Account: {}, Category: {}, Month: {}, Amount: {}", 
                accountId, categoryId, monthYear, amount);

        Budget budget = budgetRepository.findByAccountIdAndCategoryIdAndMonthYear(
                accountId, categoryId, monthYear
        ).orElseThrow(() -> new AppException(
                "Budget not found for account: " + accountId + ", category: " + categoryId + ", month: " + monthYear
        ));

        BigDecimal newSpent = budget.getSpent().add(amount);
        budget.setSpent(newSpent);

        // Check if alert should be sent
        if (budget.shouldTriggerAlert()) {
            budget.setAlertSent(true);
            budgetAlertProducer.sendBudgetAlert(budget);
            log.warn("Budget alert triggered for budget: {}", budget.getBudgetId());
        }

        budgetRepository.save(budget);
    }

    /**
     * Get spending progress for a budget
     */
    public BudgetProgressDTO getProgress(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        Category category = categoryRepository.findById(budget.getCategoryId())
                .orElseThrow(() -> new AppException("Category not found"));

        BigDecimal remaining = budget.getBudgetAmount().subtract(budget.getSpent());
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        return BudgetProgressDTO.builder()
                .budgetId(budget.getBudgetId())
                .categoryName(category.getCategoryName())
                .monthYear(budget.getMonthYear())
                .budgetAmount(budget.getBudgetAmount())
                .spent(budget.getSpent())
                .remaining(remaining)
                .spendingPercentage(budget.getSpendingPercentage())
                .alertThreshold(budget.getAlertThreshold())
                .exceeded(budget.isExceeded())
                .shouldAlert(budget.shouldTriggerAlert())
                .build();
    }

    /**
     * Get all spending progress for a month
     */
    public List<BudgetProgressDTO> getMonthlyProgress(String accountId, String monthYear) {
        validateMonthYearFormat(monthYear);

        List<Budget> budgets = budgetRepository.findByAccountIdAndMonthYear(accountId, monthYear);

        return budgets.stream()
                .map(budget -> {
                    Category category = categoryRepository.findById(budget.getCategoryId())
                            .orElse(null);
                    String categoryName = category != null ? category.getCategoryName() : "Unknown";

                    BigDecimal remaining = budget.getBudgetAmount().subtract(budget.getSpent());
                    if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                        remaining = BigDecimal.ZERO;
                    }

                    return BudgetProgressDTO.builder()
                            .budgetId(budget.getBudgetId())
                            .categoryName(categoryName)
                            .monthYear(budget.getMonthYear())
                            .budgetAmount(budget.getBudgetAmount())
                            .spent(budget.getSpent())
                            .remaining(remaining)
                            .spendingPercentage(budget.getSpendingPercentage())
                            .alertThreshold(budget.getAlertThreshold())
                            .exceeded(budget.isExceeded())
                            .shouldAlert(budget.shouldTriggerAlert())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get summary statistics for all budgets in a month
     */
    public BudgetSummaryDTO getMonthlySummary(String accountId, String monthYear) {
        validateMonthYearFormat(monthYear);

        List<Budget> budgets = budgetRepository.findByAccountIdAndMonthYear(accountId, monthYear);

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        int exceededCount = 0;
        int alertCount = 0;

        for (Budget budget : budgets) {
            totalBudget = totalBudget.add(budget.getBudgetAmount());
            totalSpent = totalSpent.add(budget.getSpent());
            if (budget.isExceeded()) {
                exceededCount++;
            }
            if (budget.shouldTriggerAlert()) {
                alertCount++;
            }
        }

        BigDecimal totalRemaining = totalBudget.subtract(totalSpent);
        if (totalRemaining.compareTo(BigDecimal.ZERO) < 0) {
            totalRemaining = BigDecimal.ZERO;
        }

        BigDecimal totalPercentage = BigDecimal.ZERO;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            totalPercentage = totalSpent.multiply(new BigDecimal(100))
                    .divide(totalBudget, 2, java.math.RoundingMode.HALF_UP);
        }

        return BudgetSummaryDTO.builder()
                .monthYear(monthYear)
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .totalRemaining(totalRemaining)
                .totalPercentage(totalPercentage)
                .budgetCount(budgets.size())
                .exceededCount(exceededCount)
                .needsAlertCount(alertCount)
                .build();
    }

    /**
     * Helper method to validate monthYear format (YYYY-MM)
     */
    private void validateMonthYearFormat(String monthYear) {
        try {
            YearMonth.parse(monthYear);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid month format. Expected YYYY-MM format");
        }
    }

    /**
     * Helper method to map Budget entity to BudgetResponse DTO
     */
    private BudgetResponse mapToBudgetResponse(Budget budget, String categoryName) {
        return BudgetResponse.builder()
                .budgetId(budget.getBudgetId())
                .accountId(budget.getAccountId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .monthYear(budget.getMonthYear())
                .budgetAmount(budget.getBudgetAmount())
                .spent(budget.getSpent())
                .spendingPercentage(budget.getSpendingPercentage())
                .alertThreshold(budget.getAlertThreshold())
                .alertSent(budget.getAlertSent())
                .exceeded(budget.isExceeded())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }
}
