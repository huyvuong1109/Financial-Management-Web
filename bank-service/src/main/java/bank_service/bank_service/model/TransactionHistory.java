package bank_service.bank_service.model;

import jakarta.persistence.*;
import lombok.*;
// Timestamps are set by application when seeding transactions, so we don't use
// automatic Hibernate timestamping here (which would overwrite seeded values).

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

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status; // Trạng thái cuối cùng của giao dịch (APPROVED, FAILED, REJECTED)

    // Khi seed dữ liệu, `createdAt` và `completedAt` được gán thủ công
    // (không dùng @CreationTimestamp/@UpdateTimestamp để tránh bị ghi đè)
    private LocalDateTime createdAt; // Thời điểm bắt đầu giao dịch

    private LocalDateTime completedAt; // Thời điểm giao dịch hoàn thành

    @Column(nullable = false)
    private String categoryId;
}