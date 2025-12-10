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
public class BudgetRequest {
    private Long categoryId;
    private BigDecimal limitAmount;
    private Integer year;
    private Integer month;
}
