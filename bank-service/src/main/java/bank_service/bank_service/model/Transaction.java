package bank_service.bank_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fromAccountId;
    private String toAccountId;

    private String fromCardId; // Thẻ gửi
    private String toCardId;   // Thẻ nhận

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    // Mã xác thực gửi qua email
    private String verificationCode;

    // Thời gian hết hạn mã (VD: 5 phút)
    private LocalDateTime expiredAt;

    // Số lần thử nhập mã
    private int attempts;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String categoryId;
}
