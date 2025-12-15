package bank_service.bank_service.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetProgressDTO {
    
    private String accountId;
    
    private Integer month;
    
    private Integer year;
    
    // Tổng ngân sách trong tháng
    private BigDecimal totalBudget;
    
    // Tổng đã chi tiêu
    private BigDecimal totalSpent;
    
    // Tổng còn lại
    private BigDecimal totalRemaining;
    
    // Phần trăm đã chi tiêu
    private Double overallProgressPercent;
    
    // Chi tiết từng budget
    private List<BudgetResponse> budgets;
    
    // Danh sách cảnh báo
    private List<BudgetAlertDTO> alerts;
}
