package bank_service.bank_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatDTO {
    private Long categoryId;
    private String categoryName;
    private String categoryType;
    private BigDecimal amount;
    private Double percentage;
    private String color;
}
