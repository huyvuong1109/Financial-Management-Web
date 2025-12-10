package bank_service.bank_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialOverviewDTO {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal totalSavings;
    private List<CategoryStatDTO> expenseByCategory;
    private List<MonthlyTrendDTO> monthlyTrend;
}
