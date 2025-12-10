package bank_service.bank_service.service;

import bank_service.bank_service.dto.DepositRequest;
import bank_service.bank_service.dto.SavingsGoalDTO;
import bank_service.bank_service.dto.SavingsGoalRequest;
import bank_service.bank_service.model.SavingsGoal;
import bank_service.bank_service.model.SavingsGoalStatus;
import bank_service.bank_service.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;

    public List<SavingsGoalDTO> getSavingsGoalsByAccountId(String accountId) {
        return savingsGoalRepository.findByAccountId(accountId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SavingsGoalDTO> getActiveSavingsGoals(String accountId) {
        return savingsGoalRepository.findByAccountIdAndStatus(accountId, SavingsGoalStatus.ACTIVE).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SavingsGoalDTO getSavingsGoalById(Long id, String accountId) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        if (!goal.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to savings goal");
        }
        
        return convertToDTO(goal);
    }

    @Transactional
    public SavingsGoalDTO createSavingsGoal(SavingsGoalRequest request, String accountId) {
        SavingsGoal goal = SavingsGoal.builder()
                .accountId(accountId)
                .name(request.getName())
                .description(request.getDescription())
                .targetAmount(request.getTargetAmount())
                .currentAmount(BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .iconName(request.getIconName())
                .color(request.getColor())
                .status(SavingsGoalStatus.ACTIVE)
                .build();

        return convertToDTO(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalDTO updateSavingsGoal(Long id, SavingsGoalRequest request, String accountId) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        if (!goal.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to savings goal");
        }

        goal.setName(request.getName());
        goal.setDescription(request.getDescription());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        goal.setIconName(request.getIconName());
        goal.setColor(request.getColor());

        return convertToDTO(savingsGoalRepository.save(goal));
    }

    @Transactional
    public void deleteSavingsGoal(Long id, String accountId) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        if (!goal.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to savings goal");
        }

        savingsGoalRepository.delete(goal);
    }

    @Transactional
    public SavingsGoalDTO depositToGoal(Long id, DepositRequest request, String accountId) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        if (!goal.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to savings goal");
        }

        if (goal.getStatus() != SavingsGoalStatus.ACTIVE) {
            throw new RuntimeException("Cannot deposit to inactive savings goal");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        
        // Check if goal is completed
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(SavingsGoalStatus.COMPLETED);
        }

        return convertToDTO(savingsGoalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalDTO withdrawFromGoal(Long id, DepositRequest request, String accountId) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        
        if (!goal.getAccountId().equals(accountId)) {
            throw new RuntimeException("Unauthorized access to savings goal");
        }

        if (goal.getCurrentAmount().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient savings balance");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().subtract(request.getAmount()));
        
        // If was completed, reactivate
        if (goal.getStatus() == SavingsGoalStatus.COMPLETED && 
            goal.getCurrentAmount().compareTo(goal.getTargetAmount()) < 0) {
            goal.setStatus(SavingsGoalStatus.ACTIVE);
        }

        return convertToDTO(savingsGoalRepository.save(goal));
    }

    public BigDecimal getTotalSavings(String accountId) {
        return savingsGoalRepository.getTotalSavingsByAccountId(accountId);
    }

    private SavingsGoalDTO convertToDTO(SavingsGoal goal) {
        double percentComplete = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        return SavingsGoalDTO.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .iconName(goal.getIconName())
                .color(goal.getColor())
                .status(goal.getStatus())
                .percentComplete(Math.min(percentComplete, 100.0))
                .build();
    }
}
