package bank_service.bank_service.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho báo cáo số dư các ví/tài khoản
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletBalanceDTO {
    private String accountId;
    private String customerName;
    private String email;
    private BigDecimal availableBalance; // Số dư khả dụng
    private BigDecimal holdBalance;      // Số dư đang giữ (pending)
    private BigDecimal totalBalance;     // Tổng số dư
}
