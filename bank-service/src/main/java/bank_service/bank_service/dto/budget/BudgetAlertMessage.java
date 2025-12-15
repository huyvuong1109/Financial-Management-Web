package bank_service.bank_service.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Message gửi đến Notification Service khi budget sắp/đã vượt ngưỡng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAlertMessage {
    
    private String budgetId;
    
    private String accountId;
    
    private String accountEmail;
    
    private String categoryId;
    
    private String categoryName;
    
    private Integer budgetMonth;
    
    private Integer budgetYear;
    
    private BigDecimal budgetAmount;
    
    private BigDecimal spentAmount;
    
    private Double progressPercent;
    
    private String alertType; // "NEAR_LIMIT" or "EXCEEDED"
    
    private String message;
}
