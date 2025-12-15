package bank_service.bank_service.service;

import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.Account;
import bank_service.bank_service.model.Balance;
import bank_service.bank_service.model.Card;
import bank_service.bank_service.model.Role;
import bank_service.bank_service.repository.AccountRepository;
import bank_service.bank_service.repository.BalanceRepository;
import bank_service.bank_service.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private BalanceRepository balanceRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final PasswordEncoder passwordEncoder;

    private static final String ACCOUNT_KEY_PREFIX = "account:";
    private static final String ALL_ACCOUNTS_KEY = "accounts:all";
    private static final long CACHE_TTL = 10; // TTL 10 phút

    public AccountService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

public Account createAccount(Account account) {
    if (accountRepository.existsByEmail(account.getEmail())) {
        throw new AppException("Email is already in use");
    }

    if (accountRepository.existsByPhoneNumber(account.getPhoneNumber())) {
        throw new AppException("Phone number is already in use");
    }

    // Mã hóa mật khẩu nếu có giá trị
    if (account.getPassword() != null && !account.getPassword().isBlank()) {
        account.setPassword(passwordEncoder.encode(account.getPassword()));
    }
    Account saved = accountRepository.save(account);

    // Tự động tạo Balance cho tài khoản mới
    Balance balance = new Balance();
    balance.setAccountId(saved.getAccountId());
    balance.setAvailableBalance(BigDecimal.ZERO);
    balance.setHoldBalance(BigDecimal.ZERO);
    balanceRepository.save(balance);

    String key = ACCOUNT_KEY_PREFIX + saved.getAccountId();
    redisTemplate.opsForValue().set(key, saved, CACHE_TTL, TimeUnit.MINUTES);
    redisTemplate.delete(ALL_ACCOUNTS_KEY); // Xóa cache list

    return saved;
}

    public Optional<Account> getAccountById(String accountId) {
        String key = ACCOUNT_KEY_PREFIX + accountId;

        // Lấy từ Redis trước
        Account cached = (Account) redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return Optional.of(cached);
        }

        // Nếu không có, lấy từ DB và lưu cache
        Optional<Account> account = accountRepository.findById(accountId);
        account.ifPresent(acc -> redisTemplate.opsForValue().set(key, acc, CACHE_TTL, TimeUnit.MINUTES));

        return account;
    }

    public List<Account> getAllAccounts() {
        List<Account> cachedList = (List<Account>) redisTemplate.opsForValue().get(ALL_ACCOUNTS_KEY);
        if (cachedList != null) {
            return cachedList;
        }

        List<Account> accounts = accountRepository.findAll();
        redisTemplate.opsForValue().set(ALL_ACCOUNTS_KEY, accounts, CACHE_TTL, TimeUnit.MINUTES);
        return accounts;
    }

    public Account updateAccount(String accountId, String customerName, String email, String phoneNumber, Role role) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new AppException("Account not found"));

        acc.setCustomerName(customerName);
        acc.setEmail(email);
        acc.setPhoneNumber(phoneNumber);
        acc.setRole(role);

        Account updated = accountRepository.save(acc);

        String key = ACCOUNT_KEY_PREFIX + accountId;
        redisTemplate.opsForValue().set(key, updated, CACHE_TTL, TimeUnit.MINUTES);
        redisTemplate.delete(ALL_ACCOUNTS_KEY);

        return updated;
    }


    public void deleteAccount(String accountId) {
        // Kiểm tra còn thẻ
        List<Card> cards = cardRepository.findByAccountId(accountId);
        if (!cards.isEmpty()) {
            throw new AppException("Account cannot be deleted because it has cards.");
        }

        // Kiểm tra còn tiền
        Optional<Balance> balanceOpt = balanceRepository.findByAccountId(accountId);
        if (balanceOpt.isPresent()) {
            Balance balance = balanceOpt.get();
            BigDecimal total = balance.getAvailableBalance().add(balance.getHoldBalance());
            if (total.compareTo(BigDecimal.ZERO) > 0) {
                throw new AppException("Account cannot be deleted because balance is not zero.");
            }
        }

        accountRepository.deleteById(accountId);

        redisTemplate.delete(ACCOUNT_KEY_PREFIX + accountId);
        redisTemplate.delete(ALL_ACCOUNTS_KEY);
    }

}

