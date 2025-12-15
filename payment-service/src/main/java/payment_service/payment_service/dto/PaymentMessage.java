package payment_service.payment_service.dto;

import java.math.BigDecimal;

public record PaymentMessage(
        String paymentId,
        String fromAccountId,
        String toAccountId,
        String fromCardId, // Thẻ gửi
        String toCardId,   // Thẻ nhận
        BigDecimal amount
) {}

