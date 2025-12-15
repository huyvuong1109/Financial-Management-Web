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
public class BudgetRequest {
    
    private String categoryId; // Optional - null means total budget for the month
    
    private Integer budgetMonth; // 1-12
    
    private Integer budgetYear; // e.g., 2025
    
    private BigDecimal budgetAmount;
    
    private Integer alertThreshold; // Optional, default 80%
}
