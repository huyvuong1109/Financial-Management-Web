package bank_service.bank_service.service;

import bank_service.bank_service.dto.BudgetDTO;
import bank_service.bank_service.dto.BudgetRequest;
import bank_service.bank_service.model.Budget;
import bank_service.bank_service.model.Category;
import bank_service.bank_service.repository.BudgetRepository;
import bank_service.bank_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;

    public List<BudgetDTO> getBudgetsByAccountId(String accountId) {
        return budgetRepository.findByAccountId(accountId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BudgetDTO> getBudgetsByMonth(String accountId, Integer year, Integer month) {
        return budgetRepository.findByAccountIdAndYearAndMonth(accountId, year, month).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BudgetDTO> getCurrentMonthBudgets(String accountId) {
        LocalDate now = LocalDate.now();
        return getBudgetsByMonth(accountId, now.getYear(), now.getMonthValue());
    }

    public BudgetDTO getBudgetById(Long id, String accountId) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        if (!budget.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }
        
        return convertToDTO(budget);
    }

    @Transactional
    public BudgetDTO createBudget(BudgetRequest request, String accountId) {
        // Check if budget already exists for this category and month
        budgetRepository.findByAccountIdAndCategoryIdAndYearAndMonth(
                accountId, request.getCategoryId(), request.getYear(), request.getMonth())
                .ifPresent(b -> {
                    throw new RuntimeException("Budget already exists for this category and month");
                });

        Budget budget = Budget.builder()
                .accountId(accountId)
                .categoryId(request.getCategoryId())
                .limitAmount(request.getLimitAmount())
                .spentAmount(BigDecimal.ZERO)
                .year(request.getYear())
                .month(request.getMonth())
                .build();

        return convertToDTO(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetDTO updateBudget(Long id, BudgetRequest request, String accountId) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        if (!budget.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }

        budget.setLimitAmount(request.getLimitAmount());
        budget.setCategoryId(request.getCategoryId());

        return convertToDTO(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id, String accountId) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        
        if (!budget.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }

        budgetRepository.delete(budget);
    }

    @Transactional
    public void updateSpentAmount(String accountId, Long categoryId, BigDecimal amount) {
        LocalDate now = LocalDate.now();
        budgetRepository.findByAccountIdAndCategoryIdAndYearAndMonth(
                accountId, categoryId, now.getYear(), now.getMonthValue())
                .ifPresent(budget -> {
                    budget.setSpentAmount(budget.getSpentAmount().add(amount));
                    budgetRepository.save(budget);
                });
    }

    private BudgetDTO convertToDTO(Budget budget) {
        String categoryName = categoryRepository.findById(budget.getCategoryId())
                .map(Category::getCategoryName)
                .orElse("Unknown");

        double percentUsed = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                ? budget.getSpentAmount().divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        return BudgetDTO.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .limitAmount(budget.getLimitAmount())
                .spentAmount(budget.getSpentAmount())
                .year(budget.getYear())
                .month(budget.getMonth())
                .percentUsed(percentUsed)
                .build();
    }
}
