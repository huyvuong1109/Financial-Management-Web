package bank_service.bank_service.dto;

import bank_service.bank_service.model.TransactionStatus;
import bank_service.bank_service.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private String id;
    private String fromAccountId;
    private String toAccountId;
    private BigDecimal amount;
    private TransactionType transactionType;
    private TransactionStatus status;
    private Long categoryId;
    private String categoryName;
    private String description;
    private LocalDateTime createdAt;
}
