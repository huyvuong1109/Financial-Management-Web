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
public class CreateBudgetRequest {

    private String accountId;

    private Long categoryId;

    /**
     * Format: YYYY-MM (e.g., "2024-12")
     */
    private String monthYear;

    private BigDecimal budgetAmount;

    /**
     * Optional: Alert threshold percentage (default: 80)
     */
    @Builder.Default
    private Integer alertThreshold = 80;
}
