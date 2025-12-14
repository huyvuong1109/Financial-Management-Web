package bank_service.bank_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryDTO {

    private String monthYear;

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal totalRemaining;

    private BigDecimal totalPercentage;

    private Integer budgetCount;

    private Integer exceededCount;

    private Integer needsAlertCount;
}
