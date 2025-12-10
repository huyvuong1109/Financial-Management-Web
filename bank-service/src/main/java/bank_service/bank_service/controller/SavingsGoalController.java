package bank_service.bank_service.controller;

import bank_service.bank_service.dto.DepositRequest;
import bank_service.bank_service.dto.SavingsGoalDTO;
import bank_service.bank_service.dto.SavingsGoalRequest;
import bank_service.bank_service.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<List<SavingsGoalDTO>> getAllSavingsGoals(Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.getSavingsGoalsByAccountId(accountId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<SavingsGoalDTO>> getActiveSavingsGoals(Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.getActiveSavingsGoals(accountId));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getSavingsOverview(Authentication authentication) {
        String accountId = authentication.getName();
        List<SavingsGoalDTO> goals = savingsGoalService.getActiveSavingsGoals(accountId);
        BigDecimal totalSavings = savingsGoalService.getTotalSavings(accountId);
        
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalSavings", totalSavings);
        overview.put("activeGoals", goals.size());
        overview.put("goals", goals);
        
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavingsGoalDTO> getSavingsGoalById(
            @PathVariable Long id,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.getSavingsGoalById(id, accountId));
    }

    @PostMapping
    public ResponseEntity<SavingsGoalDTO> createSavingsGoal(
            @RequestBody SavingsGoalRequest request,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.createSavingsGoal(request, accountId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalDTO> updateSavingsGoal(
            @PathVariable Long id,
            @RequestBody SavingsGoalRequest request,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.updateSavingsGoal(id, request, accountId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavingsGoal(
            @PathVariable Long id,
            Authentication authentication) {
        String accountId = authentication.getName();
        savingsGoalService.deleteSavingsGoal(id, accountId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingsGoalDTO> depositToGoal(
            @PathVariable Long id,
            @RequestBody DepositRequest request,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.depositToGoal(id, request, accountId));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<SavingsGoalDTO> withdrawFromGoal(
            @PathVariable Long id,
            @RequestBody DepositRequest request,
            Authentication authentication) {
        String accountId = authentication.getName();
        return ResponseEntity.ok(savingsGoalService.withdrawFromGoal(id, request, accountId));
    }
}
