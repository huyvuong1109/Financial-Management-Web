package bank_service.bank_service.controller;

import bank_service.bank_service.dto.report.*;
import bank_service.bank_service.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cho các API báo cáo tài chính
 * 
 * API Endpoints:
 * 
 * 1. GET /api/reports/monthly?year={year}&month={month}
 *    - Báo cáo thu/chi theo tháng
 *    - Params: year (bắt buộc), month (tùy chọn, nếu không có sẽ lấy cả năm)
 * 
 * 2. GET /api/reports/category-expense?year={year}&month={month}&type={type}
 *    - Biểu đồ chi tiêu theo danh mục (Pie Chart)
 *    - Params: year (bắt buộc), month (tùy chọn), type (INCOME/EXPENSE, tùy chọn)
 * 
 * 3. GET /api/reports/cash-flow?year={year}&month={month}
 *    - Báo cáo dòng tiền (Cash Flow)
 *    - Params: year (bắt buộc), month (tùy chọn)
 * 
 * 4. GET /api/reports/wallet-balance
 *    - Báo cáo số dư ví của user hiện tại
 * 
 * 5. GET /api/reports/wallet-balances (ADMIN only)
 *    - Báo cáo số dư tất cả các ví
 * 
 * 6. GET /api/reports/summary?year={year}
 *    - Tổng hợp báo cáo tài chính
 *    - Params: year (bắt buộc)
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 1. API Báo cáo thu/chi theo tháng
     * GET /api/reports/monthly?year=2024&month=12
     * 
     * Response: Danh sách MonthlyReportDTO
     * - year: Năm
     * - month: Tháng
     * - totalIncome: Tổng thu
     * - totalExpense: Tổng chi
     * - netAmount: Thu - Chi
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyReportDTO>> getMonthlyReport(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            Authentication authentication
    ) {
        String accountId = authentication.getName();
        List<MonthlyReportDTO> report = reportService.getMonthlyReport(accountId, year, month);
        return ResponseEntity.ok(report);
    }

    /**
     * 2. API Biểu đồ chi tiêu theo danh mục (Pie Chart)
     * GET /api/reports/category-expense?year=2024&month=12&type=EXPENSE
     * 
     * Response: Danh sách CategoryExpenseDTO
     * - categoryId: ID danh mục
     * - categoryName: Tên danh mục
     * - categoryType: INCOME hoặc EXPENSE
     * - totalAmount: Tổng số tiền
     * - percentage: Phần trăm so với tổng
     */
    @GetMapping("/category-expense")
    public ResponseEntity<List<CategoryExpenseDTO>> getCategoryExpenseReport(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String type,
            Authentication authentication
    ) {
        String accountId = authentication.getName();
        List<CategoryExpenseDTO> report = reportService.getCategoryExpenseReport(accountId, year, month, type);
        return ResponseEntity.ok(report);
    }

    /**
     * 3. API Báo cáo dòng tiền (Cash Flow)
     * GET /api/reports/cash-flow?year=2024&month=12
     * 
     * Response: CashFlowDTO
     * - openingBalance: Số dư đầu kỳ
     * - closingBalance: Số dư cuối kỳ
     * - totalInflow: Tổng tiền vào
     * - totalOutflow: Tổng tiền ra
     * - netCashFlow: Dòng tiền ròng
     * - inflows: Chi tiết tiền vào theo danh mục
     * - outflows: Chi tiết tiền ra theo danh mục
     */
    @GetMapping("/cash-flow")
    public ResponseEntity<CashFlowDTO> getCashFlowReport(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            Authentication authentication
    ) {
        String accountId = authentication.getName();
        CashFlowDTO report = reportService.getCashFlowReport(accountId, year, month);
        return ResponseEntity.ok(report);
    }

    /**
     * 4. API Báo cáo số dư ví của user hiện tại
     * GET /api/reports/wallet-balance
     * 
     * Response: WalletBalanceDTO
     * - accountId: ID tài khoản
     * - customerName: Tên khách hàng
     * - email: Email
     * - availableBalance: Số dư khả dụng
     * - holdBalance: Số dư đang giữ
     * - totalBalance: Tổng số dư
     */
    @GetMapping("/wallet-balance")
    public ResponseEntity<WalletBalanceDTO> getWalletBalance(Authentication authentication) {
        String accountId = authentication.getName();
        WalletBalanceDTO balance = reportService.getWalletBalance(accountId);
        return ResponseEntity.ok(balance);
    }

    /**
     * 5. API Báo cáo số dư tất cả các ví (Admin only)
     * GET /api/reports/wallet-balances
     * 
     * Response: Danh sách WalletBalanceDTO
     */
    @GetMapping("/wallet-balances")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WalletBalanceDTO>> getAllWalletBalances() {
        List<WalletBalanceDTO> balances = reportService.getAllWalletBalances();
        return ResponseEntity.ok(balances);
    }

    /**
     * 6. API Tổng hợp báo cáo tài chính
     * GET /api/reports/summary?year=2024
     * 
     * Response: FinancialSummaryDTO
     * - totalBalance: Tổng số dư
     * - totalIncome: Tổng thu nhập trong năm
     * - totalExpense: Tổng chi tiêu trong năm
     * - netAmount: Thu nhập ròng
     * - totalTransactions: Tổng số giao dịch
     * - monthlyTrend: Xu hướng thu/chi theo tháng
     */
    @GetMapping("/summary")
    public ResponseEntity<FinancialSummaryDTO> getFinancialSummary(
            @RequestParam int year,
            Authentication authentication
    ) {
        String accountId = authentication.getName();
        FinancialSummaryDTO summary = reportService.getFinancialSummary(accountId, year);
        return ResponseEntity.ok(summary);
    }

    /**
     * API Báo cáo thu/chi theo tháng cho Admin (xem của user khác)
     * GET /api/reports/admin/monthly/{accountId}?year=2024&month=12
     */
    @GetMapping("/admin/monthly/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MonthlyReportDTO>> getMonthlyReportByAdmin(
            @PathVariable String accountId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month
    ) {
        List<MonthlyReportDTO> report = reportService.getMonthlyReport(accountId, year, month);
        return ResponseEntity.ok(report);
    }

    /**
     * API Biểu đồ chi tiêu theo danh mục cho Admin
     * GET /api/reports/admin/category-expense/{accountId}?year=2024&month=12&type=EXPENSE
     */
    @GetMapping("/admin/category-expense/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CategoryExpenseDTO>> getCategoryExpenseReportByAdmin(
            @PathVariable String accountId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String type
    ) {
        List<CategoryExpenseDTO> report = reportService.getCategoryExpenseReport(accountId, year, month, type);
        return ResponseEntity.ok(report);
    }

    /**
     * API Báo cáo dòng tiền cho Admin
     * GET /api/reports/admin/cash-flow/{accountId}?year=2024&month=12
     */
    @GetMapping("/admin/cash-flow/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashFlowDTO> getCashFlowReportByAdmin(
            @PathVariable String accountId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month
    ) {
        CashFlowDTO report = reportService.getCashFlowReport(accountId, year, month);
        return ResponseEntity.ok(report);
    }

    /**
     * API Tổng hợp báo cáo tài chính cho Admin
     * GET /api/reports/admin/summary/{accountId}?year=2024
     */
    @GetMapping("/admin/summary/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FinancialSummaryDTO> getFinancialSummaryByAdmin(
            @PathVariable String accountId,
            @RequestParam int year
    ) {
        FinancialSummaryDTO summary = reportService.getFinancialSummary(accountId, year);
        return ResponseEntity.ok(summary);
    }
}
