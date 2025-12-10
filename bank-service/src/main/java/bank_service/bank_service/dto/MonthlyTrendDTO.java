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
public class MonthlyTrendDTO {
    private String month;
    private Integer year;
    private Integer monthNumber;
    private BigDecimal income;
    private BigDecimal expense;
}
