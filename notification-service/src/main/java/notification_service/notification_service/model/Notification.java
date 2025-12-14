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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String paymentId;
    private String fromAccountId;
    private String toAccountId;
    private BigDecimal amount;
    private String fromCardId; // Thẻ gửi
    private String toCardId;   // Thẻ nhận
    @CreatedDate
    private LocalDateTime createdAt;
}
