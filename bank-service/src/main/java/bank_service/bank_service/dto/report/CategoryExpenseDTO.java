package bank_service.bank_service.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho biểu đồ chi tiêu theo danh mục (Pie Chart)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryExpenseDTO {
    private Long categoryId;
    private String categoryName;
    private String categoryType;         // INCOME hoặc EXPENSE
    private BigDecimal totalAmount;      // Tổng số tiền
    private Double percentage;           // Phần trăm so với tổng
}
