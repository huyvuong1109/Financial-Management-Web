package notification_service.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlertEvent implements Serializable {

    private Long budgetId;

    private String accountId;

    private String categoryName;

    private String monthYear;

    private BigDecimal budgetAmount;

    private BigDecimal spent;

    private BigDecimal spendingPercentage;

    private Integer alertThreshold;

    private Boolean exceeded;

    private LocalDateTime timestamp;
}
