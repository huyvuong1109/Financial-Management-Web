package payment_service.payment_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;
import payment_service.payment_service.dto.PaymentMessage;
import payment_service.payment_service.dto.PaymentRequest;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final JmsTemplate jmsTemplate;
    private final ObjectMapper objectMapper;

    public void sendPayment(PaymentRequest request) {
        try {
            PaymentMessage message = new PaymentMessage(
                    request.getPaymentId(),
                    request.getFromAccountId(),
                    request.getToAccountId(),
                    request.getFromCardId(), // Thẻ gửi
                    request.getToCardId(),   // Thẻ nhận
                    request.getAmount()
            );
            String json = objectMapper.writeValueAsString(message);

            jmsTemplate.convertAndSend("payment-queue", json);
            System.out.println("Sent payment message: " + json);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send payment", e);
        }
    }
}
