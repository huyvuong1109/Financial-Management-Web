//package bank_service.bank_service.controller;
//
//import bank_service.bank_service.model.Transaction;
//import bank_service.bank_service.model.TransactionHistory;
//import bank_service.bank_service.model.TransactionStatus;
//import bank_service.bank_service.model.TransactionType;
//import bank_service.bank_service.service.TransactionService;
//import bank_service.bank_service.exception.AppException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//
//import java.math.BigDecimal;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//@ExtendWith(MockitoExtension.class)
//class TransactionControllerTest {
//
//    @Mock
//    private TransactionService transactionService;
//
//    @Mock
//    private Authentication authentication;
//
//    @InjectMocks
//    private TransactionController transactionController;
//
//    private Transaction sampleTx;
//
//    @BeforeEach
//    void setUp() {
//        sampleTx = Transaction.builder()
//                .id("tx123")
//                .fromAccountId("user1")
//                .toAccountId("user2")
//                .amount(BigDecimal.valueOf(100))
//                .status(TransactionStatus.PENDING)
//                .transactionType(TransactionType.TRANSFER)
//                .build();
//    }
//
//    // --- 1. createTransaction ---
//    @Test
//    void createTransaction_Success() {
//        Map<String, Object> request = Map.of(
//                "fromAccountId", "user1",
//                "toAccountId", "user2",
//                "amount", 100
//        );
//
//        when(transactionService.createTransaction("user1", "user2", BigDecimal.valueOf(100)))
//                .thenReturn(sampleTx);
//
//        ResponseEntity<Transaction> response = transactionController.createTransaction(request);
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(sampleTx, response.getBody());
//        verify(transactionService).createTransaction("user1", "user2", BigDecimal.valueOf(100));
//    }
//
//    @Test
//    void createTransaction_Fail_SameAccount() {
//        Map<String, Object> request = Map.of(
//                "fromAccountId", "user1",
//                "toAccountId", "user1",
//                "amount", 100
//        );
//
//        when(transactionService.createTransaction(any(), any(), any()))
//                .thenThrow(new AppException("Cannot transfer to the same account"));
//
//        assertThrows(AppException.class,
//                () -> transactionController.createTransaction(request));
//    }
//
//    // --- 2. verifyTransaction ---
//    @Test
//    void verifyTransaction_Success() {
//        Map<String, String> request = Map.of("verificationCode", "123456");
//        when(transactionService.verifyTransaction("tx123", "123456"))
//                .thenReturn(sampleTx);
//
//        ResponseEntity<Transaction> response = transactionController.verifyTransaction("tx123", request);
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(sampleTx, response.getBody());
//    }
//
//    @Test
//    void verifyTransaction_Fail_NotFound() {
//        Map<String, String> request = Map.of("verificationCode", "123456");
//        when(transactionService.verifyTransaction("tx123", "123456"))
//                .thenThrow(new AppException("Transaction not found"));
//
//        assertThrows(AppException.class,
//                () -> transactionController.verifyTransaction("tx123", request));
//    }
//
//    // --- 3. approveTransaction ---
//    @Test
//    void approveTransaction_Success() {
//        when(transactionService.approveTransaction("tx123")).thenReturn(sampleTx);
//
//        ResponseEntity<Transaction> response = transactionController.approveTransaction("tx123");
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(sampleTx, response.getBody());
//    }
//
//    @Test
//    void approveTransaction_Fail_InvalidStatus() {
//        when(transactionService.approveTransaction("tx123"))
//                .thenThrow(new AppException("Transaction is not awaiting approval"));
//
//        assertThrows(AppException.class,
//                () -> transactionController.approveTransaction("tx123"));
//    }
//
//    // --- 4. rejectTransaction ---
//    @Test
//    void rejectTransaction_Success() {
//        when(transactionService.rejectTransaction("tx123")).thenReturn(sampleTx);
//
//        ResponseEntity<Transaction> response = transactionController.rejectTransaction("tx123");
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(sampleTx, response.getBody());
//    }
//
//    @Test
//    void rejectTransaction_Fail_InvalidStatus() {
//        when(transactionService.rejectTransaction("tx123"))
//                .thenThrow(new AppException("Transaction is not awaiting approval"));
//
//        assertThrows(AppException.class,
//                () -> transactionController.rejectTransaction("tx123"));
//    }
//
//    // --- 5. deposit ---
//    @Test
//    void deposit_Success() {
//        Map<String, Object> request = Map.of("amount", 100);
//        when(transactionService.recordDepositTransaction("user1", BigDecimal.valueOf(100)))
//                .thenReturn(sampleTx);
//
//        ResponseEntity<Transaction> response = transactionController.deposit("user1", request);
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(sampleTx, response.getBody());
//    }
//
//    @Test
//    void deposit_Fail() {
//        Map<String, Object> request = Map.of("amount", 100);
//        when(transactionService.recordDepositTransaction("user1", BigDecimal.valueOf(100)))
//                .thenThrow(new AppException("Deposit failed"));
//
//        assertThrows(AppException.class,
//                () -> transactionController.deposit("user1", request));
//    }
//
//    // --- 6. withdraw ---
//    @Test
//    void withdraw_Success_Admin() {
//        Map<String, Object> request = Map.of("amount", 50);
//        when(authentication.getName()).thenReturn("admin");
//        Set<SimpleGrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_ADMIN"));
//        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
//
//        when(transactionService.recordWithdrawalTransaction("user1", BigDecimal.valueOf(50)))
//                .thenReturn(sampleTx);
//
//        ResponseEntity<?> response = transactionController.withdraw("user1", request, authentication);
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(sampleTx, response.getBody());
//    }
//
//    @Test
//    void withdraw_Forbidden_NotOwnerOrAdmin() {
//        Map<String, Object> request = Map.of("amount", 50);
//        when(authentication.getName()).thenReturn("userX");
//        Set<SimpleGrantedAuthority> authorities = Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
//        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
//
//        ResponseEntity<?> response = transactionController.withdraw("user1", request, authentication);
//
//        assertEquals(403, response.getStatusCodeValue());
//    }
//
//    // --- 7. getAwaitingApprovalTransactions ---
//    @Test
//    void getAwaitingApprovalTransactions_Success() {
//        Page<Transaction> page = new PageImpl<>(List.of(sampleTx));
//        when(transactionService.getAwaitingApprovalTransactions(any())).thenReturn(page);
//
//        ResponseEntity<Page<Transaction>> response = transactionController.getAwaitingApprovalTransactions(0, 10);
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(1, response.getBody().getTotalElements());
//    }
//
//    // --- 8. getMyTransactionHistory ---
//    @Test
//    void getMyTransactionHistory_Success() {
//        Page<TransactionHistory> page = new PageImpl<>(List.of());
//        when(authentication.getName()).thenReturn("user1");
//        when(transactionService.getMyTransactionHistory(eq("user1"), any())).thenReturn(page);
//
//        ResponseEntity<Page<TransactionHistory>> response =
//                transactionController.getMyTransactionHistory(PageRequest.of(0, 10), authentication);
//
//        assertEquals(200, response.getStatusCodeValue());
//    }
//
//    // --- 9. getAllTransactionsForAdmin ---
//    @Test
//    void getAllTransactionsForAdmin_Success() {
//        Page<Transaction> page = new PageImpl<>(List.of(sampleTx));
//        when(transactionService.getAllTransactions(Optional.empty(), Optional.empty(), PageRequest.of(0, 10)))
//                .thenReturn(page);
//
//        ResponseEntity<Page<Transaction>> response = transactionController.getAllTransactionsForAdmin(
//                PageRequest.of(0, 10), Optional.empty(), Optional.empty());
//
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals(1, response.getBody().getTotalElements());
//    }
//}
//
