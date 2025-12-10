package bank_service.bank_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryFullInfoDTO {
    private Long cardId;
    private String accountId;
    private String customerName;
    private String email;
    private String phoneNumber;
    private String cardType;
    private LocalDate expiryDate;
    private String status;
    private BigDecimal availableBalance;
    private BigDecimal holdBalance;
}
