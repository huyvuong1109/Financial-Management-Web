package bank_service.bank_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String accountId;

    // Nullable - nếu null thì là budget tổng, nếu có thì là budget theo category
    private String categoryId;

    @Column(nullable = false)
    private Integer budgetMonth; // 1-12

    @Column(nullable = false)
    private Integer budgetYear; // e.g., 2025

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal budgetAmount;

    // Ngưỡng cảnh báo (mặc định 80%)
    @Column(nullable = false)
    @Builder.Default
    private Integer alertThreshold = 80;

    // Đã gửi cảnh báo chưa (để tránh gửi lặp)
    @Column(nullable = false)
    @Builder.Default
    private Boolean alertSent = false;

    // Đã gửi cảnh báo vượt ngân sách chưa
    @Column(nullable = false)
    @Builder.Default
    private Boolean exceededAlertSent = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
