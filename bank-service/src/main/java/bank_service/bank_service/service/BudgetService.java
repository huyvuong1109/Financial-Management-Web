package bank_service.bank_service.service;

import bank_service.bank_service.dto.budget.*;
import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.Budget;
import bank_service.bank_service.model.Category;
import bank_service.bank_service.model.TransactionStatus;
import bank_service.bank_service.repository.AccountRepository;
import bank_service.bank_service.repository.BudgetRepository;
import bank_service.bank_service.repository.CategoryRepository;
import bank_service.bank_service.repository.TransactionHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final JmsTemplate jmsTemplate;
    private final ObjectMapper objectMapper;

    private static final String BUDGET_ALERT_QUEUE = "budget-alert-queue";

    /**
     * Tạo ngân sách mới
     */
    @Transactional
    public BudgetResponse createBudget(String accountId, BudgetRequest request) {
        // Validate
        if (request.getBudgetAmount() == null || request.getBudgetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Budget amount must be greater than 0");
        }
        if (request.getBudgetMonth() == null || request.getBudgetMonth() < 1 || request.getBudgetMonth() > 12) {
            throw new AppException("Invalid budget month");
        }
        if (request.getBudgetYear() == null || request.getBudgetYear() < 2020) {
            throw new AppException("Invalid budget year");
        }

        // Kiểm tra xem đã có budget cho category/tháng này chưa
        Optional<Budget> existingBudget;
        if (request.getCategoryId() != null) {
            // Validate category exists and belongs to user
            Category category = categoryRepository.findById(Long.parseLong(request.getCategoryId()))
                    .orElseThrow(() -> new AppException("Category not found"));
            if (!category.getAccountId().equals(accountId)) {
                throw new AppException("Category does not belong to this account");
            }
            
            existingBudget = budgetRepository.findByAccountIdAndCategoryIdAndBudgetMonthAndBudgetYear(
                    accountId, request.getCategoryId(), request.getBudgetMonth(), request.getBudgetYear());
        } else {
            existingBudget = budgetRepository.findTotalBudgetByAccountAndMonth(
                    accountId, request.getBudgetMonth(), request.getBudgetYear());
        }

        if (existingBudget.isPresent()) {
            throw new AppException("Budget already exists for this category/month. Use update instead.");
        }

        // Tạo budget mới
        Budget budget = Budget.builder()
                .accountId(accountId)
                .categoryId(request.getCategoryId())
                .budgetMonth(request.getBudgetMonth())
                .budgetYear(request.getBudgetYear())
                .budgetAmount(request.getBudgetAmount())
                .alertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 80)
                .alertSent(false)
                .exceededAlertSent(false)
                .build();

        Budget savedBudget = budgetRepository.save(budget);
        log.info("Created budget {} for account {} in {}/{}", 
                savedBudget.getId(), accountId, request.getBudgetMonth(), request.getBudgetYear());

        return toBudgetResponse(savedBudget);
    }

    /**
     * Cập nhật ngân sách
     */
    @Transactional
    public BudgetResponse updateBudget(String accountId, String budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        if (!budget.getAccountId().equals(accountId)) {
            throw new AppException("Budget does not belong to this account");
        }

        if (request.getBudgetAmount() != null && request.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0) {
            budget.setBudgetAmount(request.getBudgetAmount());
            // Reset alert flags khi thay đổi budget amount
            budget.setAlertSent(false);
            budget.setExceededAlertSent(false);
        }
        if (request.getAlertThreshold() != null) {
            budget.setAlertThreshold(request.getAlertThreshold());
            budget.setAlertSent(false);
        }

        Budget updatedBudget = budgetRepository.save(budget);
        log.info("Updated budget {}", budgetId);

        return toBudgetResponse(updatedBudget);
    }

    /**
     * Xóa ngân sách
     */
    @Transactional
    public void deleteBudget(String accountId, String budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        if (!budget.getAccountId().equals(accountId)) {
            throw new AppException("Budget does not belong to this account");
        }

        budgetRepository.delete(budget);
        log.info("Deleted budget {}", budgetId);
    }

    /**
     * Lấy tất cả budget của account
     */
    public List<BudgetResponse> getAllBudgets(String accountId) {
        List<Budget> budgets = budgetRepository.findByAccountIdOrderByBudgetYearDescBudgetMonthDesc(accountId);
        return budgets.stream().map(this::toBudgetResponse).toList();
    }

    /**
     * Lấy tiến độ chi tiêu của tháng
     */
    public BudgetProgressDTO getBudgetProgress(String accountId, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findByAccountIdAndBudgetMonthAndBudgetYear(
                accountId, month, year);

        List<BudgetResponse> budgetResponses = budgets.stream()
                .map(this::toBudgetResponse)
                .toList();

        List<BudgetAlertDTO> alerts = new ArrayList<>();

        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;

        for (BudgetResponse br : budgetResponses) {
            totalBudget = totalBudget.add(br.getBudgetAmount());
            totalSpent = totalSpent.add(br.getSpentAmount());

            // Collect alerts
            if (br.getIsExceeded()) {
                alerts.add(BudgetAlertDTO.builder()
                        .budgetId(br.getId())
                        .categoryId(br.getCategoryId())
                        .categoryName(br.getCategoryName())
                        .alertType(BudgetAlertDTO.AlertType.EXCEEDED)
                        .message(String.format("Đã vượt ngân sách %s: %.0f%% (%.2f / %.2f)",
                                br.getCategoryName() != null ? br.getCategoryName() : "tổng",
                                br.getProgressPercent(), br.getSpentAmount(), br.getBudgetAmount()))
                        .budgetAmount(br.getBudgetAmount())
                        .spentAmount(br.getSpentAmount())
                        .progressPercent(br.getProgressPercent())
                        .alertThreshold(br.getAlertThreshold())
                        .build());
            } else if (br.getIsNearLimit()) {
                alerts.add(BudgetAlertDTO.builder()
                        .budgetId(br.getId())
                        .categoryId(br.getCategoryId())
                        .categoryName(br.getCategoryName())
                        .alertType(BudgetAlertDTO.AlertType.NEAR_LIMIT)
                        .message(String.format("Sắp vượt ngân sách %s: %.0f%% (%.2f / %.2f)",
                                br.getCategoryName() != null ? br.getCategoryName() : "tổng",
                                br.getProgressPercent(), br.getSpentAmount(), br.getBudgetAmount()))
                        .budgetAmount(br.getBudgetAmount())
                        .spentAmount(br.getSpentAmount())
                        .progressPercent(br.getProgressPercent())
                        .alertThreshold(br.getAlertThreshold())
                        .build());
            }
        }

        Double overallProgress = totalBudget.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        return BudgetProgressDTO.builder()
                .accountId(accountId)
                .month(month)
                .year(year)
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .totalRemaining(totalBudget.subtract(totalSpent))
                .overallProgressPercent(overallProgress)
                .budgets(budgetResponses)
                .alerts(alerts)
                .build();
    }

    /**
     * Lấy chi tiết một budget
     */
    public BudgetResponse getBudgetById(String accountId, String budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("Budget not found"));

        if (!budget.getAccountId().equals(accountId)) {
            throw new AppException("Budget does not belong to this account");
        }

        return toBudgetResponse(budget);
    }

    /**
     * Kiểm tra và gửi cảnh báo cho tất cả budget của tháng hiện tại
     * Có thể gọi bằng scheduled job hoặc sau mỗi giao dịch
     */
    @Transactional
    public List<BudgetAlertDTO> checkAndSendAlerts(String accountId) {
        LocalDateTime now = LocalDateTime.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        List<Budget> budgets = budgetRepository.findByAccountIdAndBudgetMonthAndBudgetYear(
                accountId, currentMonth, currentYear);

        List<BudgetAlertDTO> sentAlerts = new ArrayList<>();
        String accountEmail = getAccountEmail(accountId);

        for (Budget budget : budgets) {
            BigDecimal spentAmount = calculateSpentAmount(budget);
            double progressPercent = calculateProgressPercent(budget.getBudgetAmount(), spentAmount);

            // Kiểm tra vượt ngân sách
            if (progressPercent > 100 && !budget.getExceededAlertSent()) {
                BudgetAlertDTO alert = createAndSendAlert(budget, spentAmount, progressPercent, 
                        BudgetAlertDTO.AlertType.EXCEEDED, accountEmail);
                sentAlerts.add(alert);
                budget.setExceededAlertSent(true);
                budget.setAlertSent(true);
                budgetRepository.save(budget);
            }
            // Kiểm tra sắp vượt ngưỡng
            else if (progressPercent >= budget.getAlertThreshold() && !budget.getAlertSent()) {
                BudgetAlertDTO alert = createAndSendAlert(budget, spentAmount, progressPercent,
                        BudgetAlertDTO.AlertType.NEAR_LIMIT, accountEmail);
                sentAlerts.add(alert);
                budget.setAlertSent(true);
                budgetRepository.save(budget);
            }
        }

        return sentAlerts;
    }

    // ==================== Private Helper Methods ====================

    private BudgetResponse toBudgetResponse(Budget budget) {
        BigDecimal spentAmount = calculateSpentAmount(budget);
        BigDecimal remainingAmount = budget.getBudgetAmount().subtract(spentAmount);
        double progressPercent = calculateProgressPercent(budget.getBudgetAmount(), spentAmount);

        String categoryName = null;
        if (budget.getCategoryId() != null) {
            categoryName = categoryRepository.findById(Long.parseLong(budget.getCategoryId()))
                    .map(Category::getCategoryName)
                    .orElse("Unknown");
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .accountId(budget.getAccountId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .budgetMonth(budget.getBudgetMonth())
                .budgetYear(budget.getBudgetYear())
                .budgetAmount(budget.getBudgetAmount())
                .spentAmount(spentAmount)
                .remainingAmount(remainingAmount)
                .progressPercent(progressPercent)
                .alertThreshold(budget.getAlertThreshold())
                .isNearLimit(progressPercent >= budget.getAlertThreshold() && progressPercent <= 100)
                .isExceeded(progressPercent > 100)
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }

    private BigDecimal calculateSpentAmount(Budget budget) {
        YearMonth yearMonth = YearMonth.of(budget.getBudgetYear(), budget.getBudgetMonth());
        // Tính chi tiêu từ đầu tháng
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        if (budget.getCategoryId() != null) {
            // Chi tiêu theo category (chỉ tính expense - fromAccountId)
            return transactionHistoryRepository.sumExpenseByCategoryId(
                    budget.getAccountId(),
                    budget.getCategoryId(),
                    TransactionStatus.APPROVED,
                    startDate,
                    endDate);
        } else {
            // Tổng chi tiêu trong tháng (tất cả outgoing transactions)
            return transactionHistoryRepository.sumOutgoingAmount(
                    budget.getAccountId(),
                    TransactionStatus.APPROVED,
                    startDate,
                    endDate);
        }
    }

    private double calculateProgressPercent(BigDecimal budgetAmount, BigDecimal spentAmount) {
        if (budgetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return spentAmount.divide(budgetAmount, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private String getAccountEmail(String accountId) {
        return accountRepository.findById(accountId)
                .map(account -> account.getEmail())
                .orElse(null);
    }

    private BudgetAlertDTO createAndSendAlert(Budget budget, BigDecimal spentAmount, 
            double progressPercent, BudgetAlertDTO.AlertType alertType, String accountEmail) {
        
        String categoryName = null;
        if (budget.getCategoryId() != null) {
            categoryName = categoryRepository.findById(Long.parseLong(budget.getCategoryId()))
                    .map(Category::getCategoryName)
                    .orElse("Unknown");
        }

        String message;
        if (alertType == BudgetAlertDTO.AlertType.EXCEEDED) {
            message = String.format("⚠️ CẢNH BÁO: Bạn đã VƯỢT ngân sách %s tháng %d/%d! " +
                    "Đã chi: %.2f / %.2f (%.0f%%)",
                    categoryName != null ? "'" + categoryName + "'" : "tổng",
                    budget.getBudgetMonth(), budget.getBudgetYear(),
                    spentAmount, budget.getBudgetAmount(), progressPercent);
        } else {
            message = String.format("⚠️ CẢNH BÁO: Bạn sắp vượt ngân sách %s tháng %d/%d! " +
                    "Đã chi: %.2f / %.2f (%.0f%%)",
                    categoryName != null ? "'" + categoryName + "'" : "tổng",
                    budget.getBudgetMonth(), budget.getBudgetYear(),
                    spentAmount, budget.getBudgetAmount(), progressPercent);
        }

        // Gửi message đến Notification Service qua JMS
        try {
            BudgetAlertMessage alertMessage = BudgetAlertMessage.builder()
                    .budgetId(budget.getId())
                    .accountId(budget.getAccountId())
                    .accountEmail(accountEmail)
                    .categoryId(budget.getCategoryId())
                    .categoryName(categoryName)
                    .budgetMonth(budget.getBudgetMonth())
                    .budgetYear(budget.getBudgetYear())
                    .budgetAmount(budget.getBudgetAmount())
                    .spentAmount(spentAmount)
                    .progressPercent(progressPercent)
                    .alertType(alertType.name())
                    .message(message)
                    .build();

            String jsonMessage = objectMapper.writeValueAsString(alertMessage);
            jmsTemplate.convertAndSend(BUDGET_ALERT_QUEUE, jsonMessage);
            log.info("Sent budget alert to queue: {}", alertMessage);
        } catch (Exception e) {
            log.error("Failed to send budget alert to queue", e);
        }

        return BudgetAlertDTO.builder()
                .budgetId(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(categoryName)
                .alertType(alertType)
                .message(message)
                .budgetAmount(budget.getBudgetAmount())
                .spentAmount(spentAmount)
                .progressPercent(progressPercent)
                .alertThreshold(budget.getAlertThreshold())
                .build();
    }
}
