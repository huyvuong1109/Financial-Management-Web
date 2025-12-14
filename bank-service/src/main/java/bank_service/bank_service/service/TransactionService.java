package bank_service.bank_service.service;

import bank_service.bank_service.dto.PaymentRequest;
import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.*;
import bank_service.bank_service.repository.AccountRepository;
import bank_service.bank_service.repository.BalanceRepository;
import bank_service.bank_service.repository.TransactionHistoryRepository;
import bank_service.bank_service.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final BalanceRepository balanceRepository;
    private final EmailService emailService;
    private final PaymentClient paymentClient;
    private final TransactionHistoryRepository transactionHistoryRepository;
    private final BalanceService balanceService;
    
    private BudgetService budgetService;
    
    @Autowired
    public void setBudgetService(@Lazy BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @Transactional
    public Transaction createTransaction(String fromAccountId, String toAccountId, BigDecimal amount, String categoryId) {
        if (fromAccountId.equals(toAccountId)) {
            throw new AppException("Cannot transfer to the same account");
        }

        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new AppException("Source account not found"));
        accountRepository.findById(toAccountId)
                .orElseThrow(() -> new AppException("Target account not found"));

        Balance fromBalance = balanceRepository.findById(fromAccountId)
                .orElseThrow(() -> new AppException("Sender balance not found"));

        if (fromBalance.getAvailableBalance().compareTo(amount) < 0) {
            throw new AppException("Insufficient balance");
        }

        // chuyển từ available -> hold
        fromBalance.setAvailableBalance(fromBalance.getAvailableBalance().subtract(amount));
        fromBalance.setHoldBalance(fromBalance.getHoldBalance().add(amount));
        Balance savedFromBalance = balanceRepository.save(fromBalance);
        // Cập nhật Redis cache
        balanceService.refreshCache(fromAccountId, savedFromBalance);

        // tạo transaction
        Transaction transaction = new Transaction();
        transaction.setFromAccountId(fromAccountId);
        transaction.setToAccountId(toAccountId);
        transaction.setAmount(amount);
        transaction.setTransactionType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setCategoryId(categoryId);

        String verificationCode = generateOtp();
        transaction.setVerificationCode(verificationCode);
        transaction.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        transaction.setAttempts(0);

        Transaction saved = transactionRepository.save(transaction);

        // gửi OTP qua email
        emailService.sendVerificationEmail(
                fromAccount.getEmail(),
                "Xác nhận giao dịch",
                verificationCode
        );

        return saved;
    }

    @Transactional
    public Transaction verifyTransaction(String transactionId, String inputCode) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException("Transaction not found"));

        if (tx.getStatus() == TransactionStatus.FAILED || tx.getAttempts() >= 3) {
            throw new AppException("Transaction is locked due to too many failed attempts");
        }
        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new AppException("Transaction is not pending and cannot be verified");
        }

        Balance fromBalance = balanceRepository.findById(tx.getFromAccountId())
                .orElseThrow(() -> new AppException("Sender balance not found"));

        // 1. Kiểm tra hết hạn OTP
        if (tx.getExpiredAt().isBefore(LocalDateTime.now())) {
            tx.setStatus(TransactionStatus.EXPIRED);
            rollbackFunds(fromBalance, tx);
            return transactionRepository.save(tx);
        }

        // 2. Kiểm tra sai OTP
        if (!tx.getVerificationCode().equals(inputCode)) {
            tx.setAttempts(tx.getAttempts() + 1);

            if (tx.getAttempts() >= 3) {
                tx.setStatus(TransactionStatus.FAILED);
                rollbackFunds(fromBalance, tx);
            }

            return transactionRepository.save(tx);
        }

        // 3. OTP đúng -> chờ admin duyệt
        tx.setStatus(TransactionStatus.AWAITING_APPROVAL);
//        return transactionRepository.save(tx);
        Transaction savedTx = transactionRepository.save(tx);

        return savedTx;
    }

    @Transactional
    public Transaction approveTransaction(String transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.AWAITING_APPROVAL) {
            throw new AppException("Transaction is not awaiting approval");
        }

        Balance fromBalance = balanceRepository.findById(tx.getFromAccountId())
                .orElseThrow(() -> new AppException("Sender balance not found"));
        
        // Tự động tạo balance cho người nhận nếu chưa có
        Balance toBalance = balanceRepository.findById(tx.getToAccountId())
                .orElseGet(() -> {
                    Balance newBalance = new Balance();
                    newBalance.setAccountId(tx.getToAccountId());
                    newBalance.setAvailableBalance(BigDecimal.ZERO);
                    newBalance.setHoldBalance(BigDecimal.ZERO);
                    return balanceRepository.save(newBalance);
                });

        // từ hold -> available của người nhận
        fromBalance.setHoldBalance(fromBalance.getHoldBalance().subtract(tx.getAmount()));
        Balance savedFromBalance = balanceRepository.save(fromBalance);
        // Cập nhật Redis cache cho người gửi
        balanceService.refreshCache(tx.getFromAccountId(), savedFromBalance);

        toBalance.setAvailableBalance(toBalance.getAvailableBalance().add(tx.getAmount()));
        Balance savedToBalance = balanceRepository.save(toBalance);
        // Cập nhật Redis cache cho người nhận
        balanceService.refreshCache(tx.getToAccountId(), savedToBalance);

        tx.setStatus(TransactionStatus.APPROVED);
        //return transactionRepository.save(tx);
        Transaction savedTx = transactionRepository.save(tx);
        saveTransactionHistory(savedTx);

        // Kiểm tra và gửi cảnh báo ngân sách cho người gửi
        try {
            budgetService.checkAndSendAlerts(tx.getFromAccountId());
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Error checking budget alerts: " + e.getMessage());
        }

        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(tx.getId());
        paymentRequest.setFromAccountId(tx.getFromAccountId());
        paymentRequest.setToAccountId(tx.getToAccountId());
        paymentRequest.setAmount(tx.getAmount());

        paymentClient.createPayment(paymentRequest);

        return savedTx;
    }

    @Transactional
    public Transaction rejectTransaction(String transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.AWAITING_APPROVAL) {
            throw new AppException("Transaction is not awaiting approval");
        }

        Balance fromBalance = balanceRepository.findById(tx.getFromAccountId())
                .orElseThrow(() -> new AppException("Sender balance not found"));

        // hoàn tiền từ hold -> available
        rollbackFunds(fromBalance, tx);

        tx.setStatus(TransactionStatus.REJECTED);
        //return transactionRepository.save(tx);
        Transaction savedTx = transactionRepository.save(tx);
        saveTransactionHistory(savedTx);

        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(tx.getId());
        paymentRequest.setFromAccountId(tx.getFromAccountId());
        paymentRequest.setToAccountId(tx.getToAccountId());
        paymentRequest.setAmount(tx.getAmount());

        paymentClient.createPayment(paymentRequest);

        return savedTx;
    }
    @Transactional
    public Transaction recordDepositTransaction(String accountId, BigDecimal amount, String categoryId) {
        // Gọi BalanceService để thực hiện nạp tiền
        balanceService.deposit(accountId, amount);

        // Tạo một bản ghi giao dịch
        Transaction transaction = new Transaction();
        transaction.setFromAccountId("0");
        transaction.setToAccountId(accountId);
        transaction.setAmount(amount);
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.APPROVED);
        transaction.setCategoryId(categoryId);

        //return transactionRepository.save(transaction);
        Transaction savedTx = transactionRepository.save(transaction);
        saveTransactionHistory(savedTx);

        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(transaction.getId());
        paymentRequest.setFromAccountId(transaction.getFromAccountId());
        paymentRequest.setToAccountId(transaction.getToAccountId());
        paymentRequest.setAmount(transaction.getAmount());

        paymentClient.createPayment(paymentRequest);

        return savedTx;

    }
    @Transactional
    public Transaction recordWithdrawalTransaction(String accountId, BigDecimal amount, String categoryId) {
        // Gọi BalanceService để thực hiện rút tiền
        balanceService.withdraw(accountId, amount);

        // Tạo một bản ghi giao dịch
        Transaction transaction = new Transaction();
        transaction.setFromAccountId(accountId);
        transaction.setToAccountId("0");
        transaction.setAmount(amount);
        transaction.setTransactionType(TransactionType.WITHDRAWAL);
        transaction.setStatus(TransactionStatus.APPROVED);
        transaction.setCategoryId(categoryId);

        //return transactionRepository.save(transaction);
        Transaction savedTx = transactionRepository.save(transaction);
        saveTransactionHistory(savedTx);

        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setPaymentId(transaction.getId());
        paymentRequest.setFromAccountId(transaction.getFromAccountId());
        paymentRequest.setToAccountId(transaction.getToAccountId());
        paymentRequest.setAmount(transaction.getAmount());

        paymentClient.createPayment(paymentRequest);

        return savedTx;
    }
    public Page<Transaction> getAwaitingApprovalTransactions(Pageable pageable) {
        return transactionRepository.findByStatus(TransactionStatus.AWAITING_APPROVAL, pageable);
    }

    public Page<Transaction> getAllTransactions(
            Optional<TransactionType> transactionType,
            Optional<TransactionStatus> status,
            Pageable pageable
    ) {
        if (transactionType.isPresent() && status.isPresent()) {
            return transactionRepository.findByTransactionTypeAndStatus(transactionType.get(), status.get(), pageable);
        } else if (transactionType.isPresent()) {
            return transactionRepository.findByTransactionType(transactionType.get(), pageable);
        } else if (status.isPresent()) {
            return transactionRepository.findByStatus(status.get(), pageable);
        } else {
            return transactionRepository.findAll(pageable);
        }
    }

    private void rollbackFunds(Balance fromBalance, Transaction tx) {
        fromBalance.setHoldBalance(fromBalance.getHoldBalance().subtract(tx.getAmount()));
        fromBalance.setAvailableBalance(fromBalance.getAvailableBalance().add(tx.getAmount()));
        Balance saved = balanceRepository.save(fromBalance);
        // Cập nhật Redis cache
        balanceService.refreshCache(tx.getFromAccountId(), saved);
    }

    private String generateOtp() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
    private void saveTransactionHistory(Transaction tx) {
        TransactionHistory history = new TransactionHistory();
        history.setId(tx.getId());
        history.setFromAccountId(tx.getFromAccountId());
        history.setToAccountId(tx.getToAccountId());
        history.setAmount(tx.getAmount());
        history.setStatus(tx.getStatus());
        history.setCompletedAt(LocalDateTime.now());
        history.setTransactionType(tx.getTransactionType());
        history.setCategoryId(tx.getCategoryId());
        transactionHistoryRepository.save(history);
    }
    @Transactional(readOnly = true)
    public Page<TransactionHistory> getMyTransactionHistory(String userId, Pageable pageable) {
        return transactionHistoryRepository.findByFromAccountIdOrToAccountId(userId, userId, pageable);
    }
}

