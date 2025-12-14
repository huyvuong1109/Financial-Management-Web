package bank_service.bank_service.controller;

import bank_service.bank_service.dto.*;
import bank_service.bank_service.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * Create a new budget
     */
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@RequestBody CreateBudgetRequest request) {
        BudgetResponse response = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get budget by ID
     */
    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> getBudgetById(@PathVariable Long budgetId) {
        BudgetResponse response = budgetService.getBudgetById(budgetId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all budgets for an account
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsByAccount(@PathVariable String accountId) {
        List<BudgetResponse> budgets = budgetService.getBudgetsByAccountId(accountId);
        return ResponseEntity.ok(budgets);
    }

    /**
     * Get budgets for a specific month
     * Query param: monthYear (format: YYYY-MM)
     */
    @GetMapping("/account/{accountId}/month")
    public ResponseEntity<List<BudgetResponse>> getBudgetsByMonth(
            @PathVariable String accountId,
            @RequestParam String monthYear) {
        List<BudgetResponse> budgets = budgetService.getBudgetsByMonthYear(accountId, monthYear);
        return ResponseEntity.ok(budgets);
    }

    /**
     * Update budget
     */
    @PutMapping("/{budgetId}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long budgetId,
            @RequestBody UpdateBudgetRequest request) {
        BudgetResponse response = budgetService.updateBudget(budgetId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete budget
     */
    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long budgetId) {
        budgetService.deleteBudget(budgetId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get spending progress for a budget
     */
    @GetMapping("/{budgetId}/progress")
    public ResponseEntity<BudgetProgressDTO> getProgress(@PathVariable Long budgetId) {
        BudgetProgressDTO progress = budgetService.getProgress(budgetId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Get monthly spending progress
     * Query param: monthYear (format: YYYY-MM)
     */
    @GetMapping("/account/{accountId}/progress")
    public ResponseEntity<List<BudgetProgressDTO>> getMonthlyProgress(
            @PathVariable String accountId,
            @RequestParam String monthYear) {
        List<BudgetProgressDTO> progress = budgetService.getMonthlyProgress(accountId, monthYear);
        return ResponseEntity.ok(progress);
    }

    /**
     * Get monthly summary statistics
     * Query param: monthYear (format: YYYY-MM)
     */
    @GetMapping("/account/{accountId}/summary")
    public ResponseEntity<BudgetSummaryDTO> getMonthlySummary(
            @PathVariable String accountId,
            @RequestParam String monthYear) {
        BudgetSummaryDTO summary = budgetService.getMonthlySummary(accountId, monthYear);
        return ResponseEntity.ok(summary);
    }
}
