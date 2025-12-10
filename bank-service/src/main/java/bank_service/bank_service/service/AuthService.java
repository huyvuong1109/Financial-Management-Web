package bank_service.bank_service.service;

import bank_service.bank_service.dto.AuthResponse;
import bank_service.bank_service.dto.LoginRequest;
import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.Account;
import bank_service.bank_service.dto.RegisterRequest;
import bank_service.bank_service.model.Role;
import bank_service.bank_service.repository.AccountRepository;
import bank_service.bank_service.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StringRedisTemplate redis;
    private final CategoryService categoryService;


    public AuthResponse register(RegisterRequest request) {
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email is already in use");
        }

        if (accountRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new AppException("Phone number is already in use");
        }

        Account account = Account.builder()
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .customerName(request.getCustomerName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        Account savedAccount = accountRepository.save(account);

        // Create default categories for the new user
        categoryService.createDefaultCategories(savedAccount.getAccountId());

        String token = jwtService.generateToken(savedAccount.getAccountId(), savedAccount.getRole());

        saveTokenToRedis(savedAccount.getAccountId(), token);
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("Account not found"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException("Incorrect Account or password");
        }

        String token = jwtService.generateToken(account.getAccountId(), account.getRole());

        saveTokenToRedis(account.getAccountId(), token);
        return AuthResponse.builder()
                .token(token)
                .build();
    }
    private void saveTokenToRedis(String accountId, String token) {
        // TTL = 1 giờ
        redis.opsForValue().set("token:" + accountId, token, 1, TimeUnit.HOURS);
    }
}
