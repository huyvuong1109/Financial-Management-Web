package bank_service.bank_service.controller;

import bank_service.bank_service.model.Category;
import bank_service.bank_service.model.CategoryType;
import bank_service.bank_service.model.Transaction;
import bank_service.bank_service.model.TransactionHistory;
import bank_service.bank_service.model.TransactionStatus;
import bank_service.bank_service.model.TransactionType;
import bank_service.bank_service.repository.CategoryRepository;
import bank_service.bank_service.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CategoryRepository categoryRepository;

    // 1. Người dùng tạo giao dịch
    @PostMapping("/create")
    public ResponseEntity<Transaction> createTransaction(
            @RequestBody Map<String, Object> request
    ) {
        String fromAccountId = (String) request.get("fromAccountId");
        String toAccountId = (String) request.get("toAccountId");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        // Chuyển đổi categoryId một cách an toàn
        String categoryId = request.get("categoryId").toString();
        String fromCardId = (String) request.get("fromCardId"); // Lấy thẻ gửi
        String toCardId = (String) request.get("toCardId");     // Lấy thẻ nhận

        Transaction tx = transactionService.createTransaction(fromAccountId, toAccountId, amount, categoryId, fromCardId, toCardId);
        return ResponseEntity.ok(tx);
    }

    // 2. Người dùng nhập mã OTP để xác nhận
    @PostMapping("/{id}/verify")
    public ResponseEntity<Transaction> verifyTransaction(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {
        String code = request.get("verificationCode");
        Transaction tx = transactionService.verifyTransaction(id, code);
        return ResponseEntity.ok(tx);
    }

    // 3. Admin duyệt giao dịch
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<Transaction> approveTransaction(@PathVariable String id) {
        Transaction tx = transactionService.approveTransaction(id);
        return ResponseEntity.ok(tx);
    }

    // 4. Admin từ chối giao dịch
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<Transaction> rejectTransaction(@PathVariable String id) {
        Transaction tx = transactionService.rejectTransaction(id);
        return ResponseEntity.ok(tx);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/awaiting-approval")
    public ResponseEntity<Page<Transaction>> getAwaitingApprovalTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionService.getAwaitingApprovalTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }
    @PostMapping("/deposit/{accountId}")
    public ResponseEntity<?> deposit(
            @PathVariable String accountId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String categoryId = (String) request.get("categoryId"); // Read categoryId

        // Đảm bảo người dùng chỉ có thể nạp tiền vào tài khoản của chính mình
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !requesterId.equals(accountId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to deposit to this account.");
        }

        // Nếu không có categoryId, tự động tìm hoặc tạo category "Lương" của account này
        if (categoryId == null || categoryId.isEmpty()) {
            Category salaryCategory = categoryRepository.findByAccountIdAndCategoryName(accountId, "Lương");
            if (salaryCategory != null) {
                // Nếu đã có category "Lương", sử dụng nó
                categoryId = salaryCategory.getCategoryId().toString();
            } else {
                // Nếu không tìm thấy category "Lương", tự động tạo mới
                Category newSalaryCategory = Category.builder()
                        .categoryName("Lương")
                        .categoryType(CategoryType.INCOME)
                        .accountId(accountId)
                        .build();
                Category savedCategory = categoryRepository.save(newSalaryCategory);
                categoryId = savedCategory.getCategoryId().toString();
            }
        }

        Transaction tx = transactionService.recordDepositTransaction(accountId, amount, categoryId);
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/withdraw/{accountId}")
    public ResponseEntity<?> withdraw(
            @PathVariable String accountId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        // Chuyển đổi categoryId một cách an toàn
        String categoryId = request.get("categoryId").toString();

        // Đảm bảo người dùng chỉ có thể rút tiền từ tài khoản của chính mình
        String requesterId = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !requesterId.equals(accountId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to withdraw from this account.");
        }

        // Nếu không có categoryId, tự động tìm hoặc tạo category "Cá nhân" của account này
        if (categoryId == null || categoryId.isEmpty()) {
            Category personalCategory = categoryRepository.findByAccountIdAndCategoryName(accountId, "Cá nhân");
            if (personalCategory != null) {
                // Nếu đã có category "Cá nhân", sử dụng nó
                categoryId = personalCategory.getCategoryId().toString();
            } else {
                // Nếu không tìm thấy category "Cá nhân", tự động tạo mới
                Category newPersonalCategory = Category.builder()
                        .categoryName("Cá nhân")
                        .categoryType(CategoryType.EXPENSE)
                        .accountId(accountId)
                        .build();
                Category savedCategory = categoryRepository.save(newPersonalCategory);
                categoryId = savedCategory.getCategoryId().toString();
            }
        }

        Transaction tx = transactionService.recordWithdrawalTransaction(accountId, amount, categoryId);
        return ResponseEntity.ok(tx);
    }
    @GetMapping("/my-history")
    public ResponseEntity<Page<TransactionHistory>> getMyTransactionHistory(
            @PageableDefault(page = 0, size = 10, sort = "completedAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication
    ) {
        String userId = authentication.getName(); // Lấy ID người dùng từ context
        Page<TransactionHistory> history = transactionService.getMyTransactionHistory(userId, pageable);
        return ResponseEntity.ok(history);
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Transaction>> getAllTransactionsForAdmin(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) Optional<TransactionType> transactionType,
            @RequestParam(required = false) Optional<TransactionStatus> status
    ) {
        Page<Transaction> transactions = transactionService.getAllTransactions(transactionType, status, pageable);
        return ResponseEntity.ok(transactions);
    }
}
