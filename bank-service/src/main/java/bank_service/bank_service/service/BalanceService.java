package bank_service.bank_service.service;

import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.Balance;
import bank_service.bank_service.repository.BalanceRepository;
import bank_service.bank_service.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final BalanceRepository balanceRepository;
    private final CardRepository cardRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String BALANCE_KEY_PREFIX = "BALANCE:";
    private static final long CACHE_TTL = 5; // phút

    public Optional<Balance> getBalance(String accountId) {
        String key = BALANCE_KEY_PREFIX + accountId;

        // 1. Lấy từ Redis
        Balance cached = (Balance) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            System.out.println("Redis HIT for account: " + accountId);
            return Optional.of(cached);
        }
        System.out.println("Redis MISS for account: " + accountId + " → Querying DB...");

        // 2. Nếu không có → lấy từ DB
        Optional<Balance> balanceOpt = balanceRepository.findById(accountId);

        // 3. Lưu vào Redis nếu tồn tại
        balanceOpt.ifPresent(b ->
                redisTemplate.opsForValue().set(key, b, CACHE_TTL, TimeUnit.MINUTES)
        );

        return balanceOpt;
    }

    public Balance deposit(String accountId, BigDecimal amount) {
        checkActiveCard(accountId);
        Balance balance = balanceRepository.findById(accountId)
                .orElse(Balance.builder()
                        .accountId(accountId)
                        .availableBalance(BigDecimal.ZERO)
                        .holdBalance(BigDecimal.ZERO)
                        .build());

        balance.setAvailableBalance(balance.getAvailableBalance().add(amount));
        // Lưu DB
        Balance saved = balanceRepository.save(balance);

        // Update cache
        updateCache(accountId, saved);

        return saved;
    }

    public Balance withdraw(String accountId, BigDecimal amount) {
        checkActiveCard(accountId);
        Balance balance = balanceRepository.findById(accountId)
                .orElseThrow(() -> new AppException("Account not found"));

        if (balance.getAvailableBalance().compareTo(amount) < 0) {
            throw new AppException("Insufficient available balance");
        }

        balance.setAvailableBalance(balance.getAvailableBalance().subtract(amount));
        // Lưu DB
        Balance saved = balanceRepository.save(balance);

        // Update cache
        updateCache(accountId, saved);

        return saved;
    }
    private void updateCache(String accountId, Balance balance) {
        String key = BALANCE_KEY_PREFIX + accountId;
        redisTemplate.opsForValue().set(key, balance, CACHE_TTL, TimeUnit.MINUTES);
    }

    /**
     * Cập nhật cache cho balance (public method để các service khác có thể gọi)
     */
    public void refreshCache(String accountId, Balance balance) {
        updateCache(accountId, balance);
    }

    /**
     * Xóa cache cho balance
     */
    public void invalidateCache(String accountId) {
        String key = BALANCE_KEY_PREFIX + accountId;
        redisTemplate.delete(key);
    }

    private void checkActiveCard(String accountId) {
        boolean hasActiveCard = cardRepository.existsByAccountIdAndStatus(accountId, "active");
        if (!hasActiveCard) {
            throw new AppException("No active card found for this account");
        }
    }
}
