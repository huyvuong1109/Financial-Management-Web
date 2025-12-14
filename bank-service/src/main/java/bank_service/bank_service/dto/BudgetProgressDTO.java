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
public class BudgetProgressDTO {

    private Long budgetId;

    private String categoryName;

    private String monthYear;

    private BigDecimal budgetAmount;

    private BigDecimal spent;

    private BigDecimal remaining;

    private BigDecimal spendingPercentage;

    private Integer alertThreshold;

    private Boolean exceeded;

    private Boolean shouldAlert;
}
