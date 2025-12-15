package bank_service.bank_service.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    
    private String id;
    
    private String accountId;
    
    private String categoryId;
    
    private String categoryName; // Tên category nếu có
    
    private Integer budgetMonth;
    
    private Integer budgetYear;
    
    private BigDecimal budgetAmount;
    
    private BigDecimal spentAmount;
    
    private BigDecimal remainingAmount;
    
    private Double progressPercent; // 0-100+
    
    private Integer alertThreshold;
    
    private Boolean isNearLimit; // >= alertThreshold%
    
    private Boolean isExceeded; // > 100%
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
