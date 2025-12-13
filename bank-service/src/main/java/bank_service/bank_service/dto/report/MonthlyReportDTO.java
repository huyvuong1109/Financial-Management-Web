package bank_service.bank_service.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho báo cáo thu/chi theo tháng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportDTO {
    private int year;
    private int month;
    private BigDecimal totalIncome;      // Tổng thu
    private BigDecimal totalExpense;     // Tổng chi
    private BigDecimal netAmount;        // Thu - Chi
}
