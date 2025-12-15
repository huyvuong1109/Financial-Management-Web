package bank_service.bank_service.controller;

import bank_service.bank_service.dto.budget.*;
import bank_service.bank_service.security.JwtService;
import bank_service.bank_service.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final JwtService jwtService;

    /**
     * Tạo ngân sách mới
     * POST /api/budgets
     */
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BudgetRequest request) {
        String accountId = extractAccountId(authHeader);
        BudgetResponse response = budgetService.createBudget(accountId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Cập nhật ngân sách
     * PUT /api/budgets/{budgetId}
     */
    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String budgetId,
            @RequestBody BudgetRequest request) {
        String accountId = extractAccountId(authHeader);
        BudgetResponse response = budgetService.updateBudget(accountId, budgetId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa ngân sách
     * DELETE /api/budgets/{budgetId}
     */
    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String budgetId) {
        String accountId = extractAccountId(authHeader);
        budgetService.deleteBudget(accountId, budgetId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy tất cả ngân sách của user
     * GET /api/budgets
     */
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @RequestHeader("Authorization") String authHeader) {
        String accountId = extractAccountId(authHeader);
        List<BudgetResponse> budgets = budgetService.getAllBudgets(accountId);
        return ResponseEntity.ok(budgets);
    }

    /**
     * Lấy chi tiết một ngân sách
     * GET /api/budgets/{budgetId}
     */
    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String budgetId) {
        String accountId = extractAccountId(authHeader);
        BudgetResponse budget = budgetService.getBudgetById(accountId, budgetId);
        return ResponseEntity.ok(budget);
    }

    /**
     * Xem tiến độ chi tiêu theo tháng (progress %)
     * GET /api/budgets/progress?month=12&year=2025
     */
    @GetMapping("/progress")
    public ResponseEntity<BudgetProgressDTO> getBudgetProgress(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        String accountId = extractAccountId(authHeader);
        
        // Mặc định là tháng/năm hiện tại
        LocalDateTime now = LocalDateTime.now();
        if (month == null) month = now.getMonthValue();
        if (year == null) year = now.getYear();
        
        BudgetProgressDTO progress = budgetService.getBudgetProgress(accountId, month, year);
        return ResponseEntity.ok(progress);
    }

    /**
     * Kiểm tra và lấy danh sách cảnh báo (có thể gọi để trigger check)
     * POST /api/budgets/check-alerts
     */
    @PostMapping("/check-alerts")
    public ResponseEntity<List<BudgetAlertDTO>> checkAlerts(
            @RequestHeader("Authorization") String authHeader) {
        String accountId = extractAccountId(authHeader);
        List<BudgetAlertDTO> alerts = budgetService.checkAndSendAlerts(accountId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Lấy danh sách cảnh báo của tháng hiện tại (không gửi notification)
     * GET /api/budgets/alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<BudgetAlertDTO>> getAlerts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        String accountId = extractAccountId(authHeader);
        
        LocalDateTime now = LocalDateTime.now();
        if (month == null) month = now.getMonthValue();
        if (year == null) year = now.getYear();
        
        BudgetProgressDTO progress = budgetService.getBudgetProgress(accountId, month, year);
        return ResponseEntity.ok(progress.getAlerts());
    }

    private String extractAccountId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtService.extractAccountId(token);
    }
}
