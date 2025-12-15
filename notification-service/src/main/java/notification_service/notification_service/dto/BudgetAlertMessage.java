package notification_service.notification_service.dto;

import java.math.BigDecimal;

/**
 * Message nhận từ Bank Service khi budget sắp/đã vượt ngưỡng
 */
public record BudgetAlertMessage(
    String budgetId,
    String accountId,
    String accountEmail,
    String categoryId,
    String categoryName,
    Integer budgetMonth,
    Integer budgetYear,
    BigDecimal budgetAmount,
    BigDecimal spentAmount,
    Double progressPercent,
    String alertType,  // "NEAR_LIMIT" or "EXCEEDED"
    String message
) {}
