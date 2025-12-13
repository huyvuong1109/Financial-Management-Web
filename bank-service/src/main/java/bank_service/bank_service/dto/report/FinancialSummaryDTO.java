package bank_service.bank_service.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO tổng hợp báo cáo tài chính
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummaryDTO {
    private BigDecimal totalBalance;             // Tổng số dư
    private BigDecimal totalIncome;              // Tổng thu nhập
    private BigDecimal totalExpense;             // Tổng chi tiêu
    private BigDecimal netAmount;                // Thu nhập ròng
    private int totalTransactions;               // Tổng số giao dịch
    private List<MonthlyReportDTO> monthlyTrend; // Xu hướng theo tháng
}
