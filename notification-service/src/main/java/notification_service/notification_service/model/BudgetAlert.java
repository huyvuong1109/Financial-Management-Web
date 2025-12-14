package notification_service.notification_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class BudgetAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String budgetId;
    
    private String accountId;
    
    private String accountEmail;
    
    private String categoryId;
    
    private String categoryName;
    
    private Integer budgetMonth;
    
    private Integer budgetYear;
    
    private BigDecimal budgetAmount;
    
    private BigDecimal spentAmount;
    
    private Double progressPercent;
    
    @Column(nullable = false)
    private String alertType; // "NEAR_LIMIT" or "EXCEEDED"
    
    @Column(length = 1000)
    private String message;
    
    private Boolean emailSent;
    
    @CreatedDate
    private LocalDateTime createdAt;
}
