package bank_service.bank_service.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho chi tiết một mục trong dòng tiền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowItemDTO {
    private String categoryName;
    private String transactionType;      // DEPOSIT, WITHDRAWAL, TRANSFER
    private BigDecimal amount;
    private int transactionCount;        // Số lượng giao dịch
}
