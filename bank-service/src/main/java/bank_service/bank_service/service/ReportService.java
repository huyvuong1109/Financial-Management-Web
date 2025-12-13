package bank_service.bank_service.service;

import bank_service.bank_service.dto.report.*;
import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.*;
import bank_service.bank_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionHistoryRepository transactionHistoryRepository;
    private final BalanceRepository balanceRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    /**
     * 1. Báo cáo thu/chi theo tháng
     * Trả về danh sách thu/chi theo từng tháng trong khoảng thời gian
     */
    public List<MonthlyReportDTO> getMonthlyReport(String accountId, int year, Integer month) {
        List<MonthlyReportDTO> reports = new ArrayList<>();

        if (month != null) {
            // Báo cáo cho một tháng cụ thể
            MonthlyReportDTO report = calculateMonthlyReport(accountId, year, month);
            reports.add(report);
        } else {
            // Báo cáo cho cả năm (12 tháng)
            for (int m = 1; m <= 12; m++) {
                MonthlyReportDTO report = calculateMonthlyReport(accountId, year, m);
                reports.add(report);
            }
        }

        return reports;
    }

    private MonthlyReportDTO calculateMonthlyReport(String accountId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // Tính tổng thu (tiền vào)
        BigDecimal totalIncome = transactionHistoryRepository.sumIncomingAmount(
                accountId, TransactionStatus.APPROVED, startDate, endDate);

        // Tính tổng chi (tiền ra)
        BigDecimal totalExpense = transactionHistoryRepository.sumOutgoingAmount(
                accountId, TransactionStatus.APPROVED, startDate, endDate);

        // Tính thu nhập ròng
        BigDecimal netAmount = totalIncome.subtract(totalExpense);

        return MonthlyReportDTO.builder()
                .year(year)
                .month(month)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .build();
    }

    /**
     * 2. Biểu đồ chi tiêu theo danh mục (Pie Chart)
     * Trả về danh sách chi tiêu/thu nhập theo từng danh mục
     */
    public List<CategoryExpenseDTO> getCategoryExpenseReport(String accountId, int year, Integer month, String type) {
        LocalDateTime startDate;
        LocalDateTime endDate;

        if (month != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            startDate = yearMonth.atDay(1).atStartOfDay();
            endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);
        } else {
            startDate = LocalDateTime.of(year, 1, 1, 0, 0, 0);
            endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        }

        // Lấy danh sách category của user
        List<Category> categories = categoryRepository.findByAccountId(accountId);
        
        // Lọc theo type nếu có
        CategoryType categoryType = null;
        if (type != null && !type.isEmpty()) {
            categoryType = CategoryType.valueOf(type.toUpperCase());
            CategoryType finalCategoryType = categoryType;
            categories = categories.stream()
                    .filter(c -> c.getCategoryType() == finalCategoryType)
                    .collect(Collectors.toList());
        }

        List<CategoryExpenseDTO> result = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Tính tổng cho từng category
        for (Category category : categories) {
            BigDecimal amount;
            if (category.getCategoryType() == CategoryType.EXPENSE) {
                amount = transactionHistoryRepository.sumExpenseByCategoryId(
                        accountId, category.getCategoryId().toString(), 
                        TransactionStatus.APPROVED, startDate, endDate);
            } else {
                amount = transactionHistoryRepository.sumIncomeByCategoryId(
                        accountId, category.getCategoryId().toString(),
                        TransactionStatus.APPROVED, startDate, endDate);
            }

            if (amount.compareTo(BigDecimal.ZERO) > 0) {
                totalAmount = totalAmount.add(amount);
                result.add(CategoryExpenseDTO.builder()
                        .categoryId(category.getCategoryId())
                        .categoryName(category.getCategoryName())
                        .categoryType(category.getCategoryType().name())
                        .totalAmount(amount)
                        .build());
            }
        }

        // Tính phần trăm
        for (CategoryExpenseDTO dto : result) {
            if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                double percentage = dto.getTotalAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalAmount, 2, RoundingMode.HALF_UP)
                        .doubleValue();
                dto.setPercentage(percentage);
            } else {
                dto.setPercentage(0.0);
            }
        }

        // Sắp xếp theo số tiền giảm dần
        result.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));

        return result;
    }

    /**
     * 3. Báo cáo dòng tiền (Cash Flow)
     * Trả về thông tin dòng tiền vào/ra trong khoảng thời gian
     */
    public CashFlowDTO getCashFlowReport(String accountId, int year, Integer month) {
        LocalDateTime startDate;
        LocalDateTime endDate;

        if (month != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            startDate = yearMonth.atDay(1).atStartOfDay();
            endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);
        } else {
            startDate = LocalDateTime.of(year, 1, 1, 0, 0, 0);
            endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        }

        // Lấy số dư hiện tại
        Balance balance = balanceRepository.findByAccountId(accountId)
                .orElseThrow(() -> new AppException("Account balance not found"));

        BigDecimal currentBalance = balance.getAvailableBalance().add(balance.getHoldBalance());

        // Tính tổng tiền vào và tiền ra
        BigDecimal totalInflow = transactionHistoryRepository.sumIncomingAmount(
                accountId, TransactionStatus.APPROVED, startDate, endDate);
        BigDecimal totalOutflow = transactionHistoryRepository.sumOutgoingAmount(
                accountId, TransactionStatus.APPROVED, startDate, endDate);

        // Tính dòng tiền ròng
        BigDecimal netCashFlow = totalInflow.subtract(totalOutflow);

        // Tính số dư đầu kỳ (số dư cuối - dòng tiền ròng)
        BigDecimal closingBalance = currentBalance;
        BigDecimal openingBalance = closingBalance.subtract(netCashFlow);

        // Chi tiết tiền vào theo danh mục
        List<CashFlowItemDTO> inflows = calculateCashFlowByCategory(accountId, startDate, endDate, true);

        // Chi tiết tiền ra theo danh mục
        List<CashFlowItemDTO> outflows = calculateCashFlowByCategory(accountId, startDate, endDate, false);

        return CashFlowDTO.builder()
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .totalInflow(totalInflow)
                .totalOutflow(totalOutflow)
                .netCashFlow(netCashFlow)
                .inflows(inflows)
                .outflows(outflows)
                .build();
    }

    private List<CashFlowItemDTO> calculateCashFlowByCategory(String accountId, 
            LocalDateTime startDate, LocalDateTime endDate, boolean isInflow) {
        
        List<Category> categories = categoryRepository.findByAccountId(accountId);
        List<CashFlowItemDTO> items = new ArrayList<>();

        for (Category category : categories) {
            BigDecimal amount;
            List<TransactionHistory> transactions;

            if (isInflow) {
                // Tiền vào: DEPOSIT hoặc TRANSFER (khi là người nhận)
                amount = transactionHistoryRepository.sumIncomeByCategoryId(
                        accountId, category.getCategoryId().toString(),
                        TransactionStatus.APPROVED, startDate, endDate);
                transactions = transactionHistoryRepository.findByCategoryAndDateRange(
                        accountId, category.getCategoryId().toString(),
                        TransactionStatus.APPROVED, startDate, endDate)
                        .stream()
                        .filter(t -> t.getToAccountId().equals(accountId))
                        .collect(Collectors.toList());
            } else {
                // Tiền ra: WITHDRAWAL hoặc TRANSFER (khi là người gửi)
                amount = transactionHistoryRepository.sumExpenseByCategoryId(
                        accountId, category.getCategoryId().toString(),
                        TransactionStatus.APPROVED, startDate, endDate);
                transactions = transactionHistoryRepository.findByCategoryAndDateRange(
                        accountId, category.getCategoryId().toString(),
                        TransactionStatus.APPROVED, startDate, endDate)
                        .stream()
                        .filter(t -> t.getFromAccountId().equals(accountId))
                        .collect(Collectors.toList());
            }

            if (amount.compareTo(BigDecimal.ZERO) > 0) {
                // Xác định loại giao dịch chủ yếu
                String mainTransactionType = transactions.stream()
                        .collect(Collectors.groupingBy(TransactionHistory::getTransactionType, Collectors.counting()))
                        .entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(e -> e.getKey().name())
                        .orElse("TRANSFER");

                items.add(CashFlowItemDTO.builder()
                        .categoryName(category.getCategoryName())
                        .transactionType(mainTransactionType)
                        .amount(amount)
                        .transactionCount(transactions.size())
                        .build());
            }
        }

        // Sắp xếp theo số tiền giảm dần
        items.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        return items;
    }

    /**
     * 4. Báo cáo số dư các ví/tài khoản
     * Trả về thông tin số dư của tài khoản hoặc tất cả tài khoản (admin)
     */
    public WalletBalanceDTO getWalletBalance(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException("Account not found"));

        Balance balance = balanceRepository.findByAccountId(accountId)
                .orElseThrow(() -> new AppException("Balance not found"));

        BigDecimal totalBalance = balance.getAvailableBalance().add(balance.getHoldBalance());

        return WalletBalanceDTO.builder()
                .accountId(accountId)
                .customerName(account.getCustomerName())
                .email(account.getEmail())
                .availableBalance(balance.getAvailableBalance())
                .holdBalance(balance.getHoldBalance())
                .totalBalance(totalBalance)
                .build();
    }

    /**
     * Lấy tất cả số dư ví (cho Admin)
     */
    public List<WalletBalanceDTO> getAllWalletBalances() {
        List<Balance> balances = balanceRepository.findAll();
        List<WalletBalanceDTO> result = new ArrayList<>();

        for (Balance balance : balances) {
            Account account = accountRepository.findById(balance.getAccountId()).orElse(null);
            if (account != null) {
                BigDecimal totalBalance = balance.getAvailableBalance().add(balance.getHoldBalance());
                result.add(WalletBalanceDTO.builder()
                        .accountId(balance.getAccountId())
                        .customerName(account.getCustomerName())
                        .email(account.getEmail())
                        .availableBalance(balance.getAvailableBalance())
                        .holdBalance(balance.getHoldBalance())
                        .totalBalance(totalBalance)
                        .build());
            }
        }

        // Sắp xếp theo tổng số dư giảm dần
        result.sort((a, b) -> b.getTotalBalance().compareTo(a.getTotalBalance()));

        return result;
    }

    /**
     * 5. Tổng hợp báo cáo tài chính
     */
    public FinancialSummaryDTO getFinancialSummary(String accountId, int year) {
        LocalDateTime startDate = LocalDateTime.of(year, 1, 1, 0, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);

        // Lấy số dư hiện tại
        Balance balance = balanceRepository.findByAccountId(accountId)
                .orElseThrow(() -> new AppException("Balance not found"));
        BigDecimal totalBalance = balance.getAvailableBalance().add(balance.getHoldBalance());

        // Tính tổng thu nhập và chi tiêu trong năm
        BigDecimal totalIncome = transactionHistoryRepository.sumIncomingAmount(
                accountId, TransactionStatus.APPROVED, startDate, endDate);
        BigDecimal totalExpense = transactionHistoryRepository.sumOutgoingAmount(
                accountId, TransactionStatus.APPROVED, startDate, endDate);
        BigDecimal netAmount = totalIncome.subtract(totalExpense);

        // Đếm số giao dịch
        int totalTransactions = transactionHistoryRepository.countByAccountIdAndDateRange(
                accountId, TransactionStatus.APPROVED, startDate, endDate);

        // Lấy xu hướng theo tháng
        List<MonthlyReportDTO> monthlyTrend = getMonthlyReport(accountId, year, null);

        return FinancialSummaryDTO.builder()
                .totalBalance(totalBalance)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .totalTransactions(totalTransactions)
                .monthlyTrend(monthlyTrend)
                .build();
    }
}
