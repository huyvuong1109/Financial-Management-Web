package bank_service.bank_service.dto;

import bank_service.bank_service.model.SavingsGoalStatus;
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
public class SavingsGoalDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private LocalDate targetDate;
    private String iconName;
    private String color;
    private SavingsGoalStatus status;
    private Double percentComplete;
}
