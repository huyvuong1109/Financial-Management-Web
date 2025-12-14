package bank_service.bank_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long budgetId;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false)
    private Long categoryId;

    /**
     * Format: YYYY-MM (e.g., "2024-12" for December 2024)
     */
    @Column(nullable = false)
    private String monthYear;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal budgetAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal spent = BigDecimal.ZERO;

    /**
     * Alert threshold percentage (e.g., 80 means alert when 80% spent)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer alertThreshold = 80;

    /**
     * Flag to indicate if alert has been sent
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean alertSent = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * Calculate the percentage of budget spent
     */
    public BigDecimal getSpendingPercentage() {
        if (budgetAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return spent.multiply(new BigDecimal(100)).divide(budgetAmount, 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Check if spending exceeds budget limit
     */
    public boolean isExceeded() {
        return spent.compareTo(budgetAmount) > 0;
    }

    /**
     * Check if alert should be triggered
     */
    public boolean shouldTriggerAlert() {
        if (alertSent) {
            return false;
        }
        return getSpendingPercentage().compareTo(new BigDecimal(alertThreshold)) >= 0;
    }
}
