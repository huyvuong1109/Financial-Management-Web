package bank_service.bank_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoalRequest {
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private LocalDate targetDate;
    private String iconName;
    private String color;
}
