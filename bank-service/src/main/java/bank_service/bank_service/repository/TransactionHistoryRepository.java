package bank_service.bank_service.repository;

import bank_service.bank_service.model.TransactionHistory;
import bank_service.bank_service.model.TransactionStatus;
import bank_service.bank_service.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, String> {
    Page<TransactionHistory> findByFromAccountIdOrToAccountId(String fromAccountId, String toAccountId, Pageable pageable);

    // Lấy tất cả giao dịch của một tài khoản theo khoảng thời gian
    @Query("SELECT th FROM TransactionHistory th WHERE " +
           "(th.fromAccountId = :accountId OR th.toAccountId = :accountId) " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    List<TransactionHistory> findByAccountIdAndDateRange(
            @Param("accountId") String accountId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Lấy giao dịch tiền vào (DEPOSIT hoặc TRANSFER khi là toAccountId)
    @Query("SELECT th FROM TransactionHistory th WHERE " +
           "th.toAccountId = :accountId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    List<TransactionHistory> findIncomingTransactions(
            @Param("accountId") String accountId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Lấy giao dịch tiền ra (WITHDRAWAL hoặc TRANSFER khi là fromAccountId)
    @Query("SELECT th FROM TransactionHistory th WHERE " +
           "th.fromAccountId = :accountId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    List<TransactionHistory> findOutgoingTransactions(
            @Param("accountId") String accountId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tính tổng tiền vào của một tài khoản
    @Query("SELECT COALESCE(SUM(th.amount), 0) FROM TransactionHistory th WHERE " +
           "th.toAccountId = :accountId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomingAmount(
            @Param("accountId") String accountId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tính tổng tiền ra của một tài khoản
    @Query("SELECT COALESCE(SUM(th.amount), 0) FROM TransactionHistory th WHERE " +
           "th.fromAccountId = :accountId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    BigDecimal sumOutgoingAmount(
            @Param("accountId") String accountId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Đếm số giao dịch theo tài khoản và khoảng thời gian
    @Query("SELECT COUNT(th) FROM TransactionHistory th WHERE " +
           "(th.fromAccountId = :accountId OR th.toAccountId = :accountId) " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    int countByAccountIdAndDateRange(
            @Param("accountId") String accountId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Lấy giao dịch theo categoryId
    @Query("SELECT th FROM TransactionHistory th WHERE " +
           "(th.fromAccountId = :accountId OR th.toAccountId = :accountId) " +
           "AND th.categoryId = :categoryId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    List<TransactionHistory> findByCategoryAndDateRange(
            @Param("accountId") String accountId,
            @Param("categoryId") String categoryId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tính tổng theo categoryId (cho expense)
    @Query("SELECT COALESCE(SUM(th.amount), 0) FROM TransactionHistory th WHERE " +
           "th.fromAccountId = :accountId " +
           "AND th.categoryId = :categoryId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByCategoryId(
            @Param("accountId") String accountId,
            @Param("categoryId") String categoryId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Tính tổng theo categoryId (cho income)
    @Query("SELECT COALESCE(SUM(th.amount), 0) FROM TransactionHistory th WHERE " +
           "th.toAccountId = :accountId " +
           "AND th.categoryId = :categoryId " +
           "AND th.status = :status " +
           "AND th.completedAt BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeByCategoryId(
            @Param("accountId") String accountId,
            @Param("categoryId") String categoryId,
            @Param("status") TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}