package bank_service.bank_service.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetAlertDTO {
    
    public enum AlertType {
        NEAR_LIMIT,    // Sắp vượt ngưỡng (>= alertThreshold%)
        EXCEEDED       // Đã vượt ngân sách (> 100%)
    }
    
    private String budgetId;
    
    private String categoryId;
    
    private String categoryName;
    
    private AlertType alertType;
    
    private String message;
    
    private BigDecimal budgetAmount;
    
    private BigDecimal spentAmount;
    
    private Double progressPercent;
    
    private Integer alertThreshold;
}
