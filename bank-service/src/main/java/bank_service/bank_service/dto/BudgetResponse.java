package bank_service.bank_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long budgetId;

    private String accountId;

    private Long categoryId;

    private String categoryName;

    private String monthYear;

    private BigDecimal budgetAmount;

    private BigDecimal spent;

    private BigDecimal spendingPercentage;

    private Integer alertThreshold;

    private Boolean alertSent;

    private Boolean exceeded;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
