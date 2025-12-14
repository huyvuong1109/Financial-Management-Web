package payment_service.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private String paymentId;
    private String fromAccountId;
    private String toAccountId;
    private String fromCardId; // Thẻ gửi
    private String toCardId;   // Thẻ nhận
    private BigDecimal amount;
}
