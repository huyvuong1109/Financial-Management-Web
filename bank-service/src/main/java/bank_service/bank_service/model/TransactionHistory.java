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
public class TransactionHistory {

    @Id
    private String id;

    private String fromAccountId;
    private String toAccountId;

    private String fromCardId;
    private String toCardId;


    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status; // Trạng thái cuối cùng của giao dịch (APPROVED, FAILED, REJECTED)

    @CreationTimestamp
    private LocalDateTime createdAt; // Thời điểm bắt đầu giao dịch

    @UpdateTimestamp
    private LocalDateTime completedAt; // Thời điểm giao dịch hoàn thành

    @Column(nullable = false)
    private String categoryId;
}