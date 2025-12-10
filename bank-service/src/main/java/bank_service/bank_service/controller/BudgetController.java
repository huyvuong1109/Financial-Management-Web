package bank_service.bank_service.controller;

import bank_service.bank_service.dto.BudgetDTO;
import bank_service.bank_service.dto.BudgetRequest;
import bank_service.bank_service.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(budgetService.getBudgetsByAccountId(accountId));
    }

    @GetMapping("/month")
    public ResponseEntity<List<BudgetDTO>> getBudgetsByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Authentication authentication) {
        String accountId = authentication.getName();
        
        if (year == null || month == null) {
            LocalDate now = LocalDate.now();
            year = now.getYear();
            month = now.getMonthValue();
        }
        
        return ResponseEntity.ok(budgetService.getBudgetsByMonth(accountId, year, month));
    }

    @GetMapping("/current")
    public ResponseEntity<List<BudgetDTO>> getCurrentMonthBudgets(Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(budgetService.getCurrentMonthBudgets(accountId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDTO> getBudgetById(
            @PathVariable Long id,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(budgetService.getBudgetById(id, accountId));
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(
            @RequestBody BudgetRequest request,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(budgetService.createBudget(request, accountId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(
            @PathVariable Long id,
            @RequestBody BudgetRequest request,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(budgetService.updateBudget(id, request, accountId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            Authentication authentication) {
        String accountId = authentication.getName();
        budgetService.deleteBudget(id, accountId);
        return ResponseEntity.noContent().build();
    }
}
