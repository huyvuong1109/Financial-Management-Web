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
public class BudgetDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private Integer year;
    private Integer month;
    private Double percentUsed;
}
