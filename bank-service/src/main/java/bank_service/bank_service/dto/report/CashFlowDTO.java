package bank_service.bank_service.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO cho báo cáo dòng tiền (Cash Flow)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowDTO {
    private BigDecimal openingBalance;   // Số dư đầu kỳ
    private BigDecimal closingBalance;   // Số dư cuối kỳ
    private BigDecimal totalInflow;      // Tổng tiền vào
    private BigDecimal totalOutflow;     // Tổng tiền ra
    private BigDecimal netCashFlow;      // Dòng tiền ròng (vào - ra)
    private List<CashFlowItemDTO> inflows;   // Chi tiết tiền vào
    private List<CashFlowItemDTO> outflows;  // Chi tiết tiền ra
}
