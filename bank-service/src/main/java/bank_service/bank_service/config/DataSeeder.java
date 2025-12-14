package bank_service.bank_service.config;

import bank_service.bank_service.model.*;
import bank_service.bank_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Data Seeder Service - Sinh dữ liệu mẫu cho báo cáo
 * 
 * Cách sử dụng:
 * 1. Gọi API: POST /bankservice/api/admin/seed-data
 * 2. Hoặc gọi API: POST /bankservice/api/admin/seed-data/{accountId} để seed cho 1 user cụ thể
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    private final Random random = new Random();

    /**
     * Seed data cho tất cả users (trừ admin)
     */
    public String seedAllUsers() {
        log.info("=== Starting Data Seeder for All Users ===");
        
        List<Account> accounts = accountRepository.findAll();
        
        if (accounts.isEmpty()) {
            return "No accounts found. Please create accounts first.";
        }

        int seededCount = 0;
        for (Account account : accounts) {
            if (account.getRole() == Role.ADMIN) {
                continue;
            }
            
            seedForAccount(account.getAccountId());
            seededCount++;
        }
        
        log.info("=== Data Seeder Completed for {} users ===", seededCount);
        return "Successfully seeded data for " + seededCount + " users";
    }

    /**
     * Seed data cho một account cụ thể
     */
    public String seedForAccount(String accountId) {
        log.info("Seeding data for account: {}", accountId);
        
        // 1. Tạo Categories nếu chưa có
        List<Category> categories = seedCategories(accountId);
        
        // 2. Tạo Transaction History
        int transactionCount = seedTransactionHistory(accountId, categories);
        
        return "Created " + categories.size() + " categories and " + transactionCount + " transactions for account: " + accountId;
    }

    /**
     * Tạo các danh mục mẫu cho user
     */
    private List<Category> seedCategories(String accountId) {
        List<Category> existingCategories = categoryRepository.findByAccountId(accountId);
        
        if (!existingCategories.isEmpty()) {
            log.info("Categories already exist for account: {}", accountId);
            return existingCategories;
        }

        List<Category> categories = new ArrayList<>();

        // Danh mục THU NHẬP
        String[] incomeNames = {"Lương", "Thưởng", "Đầu tư", "Freelance", "Cho thuê", "Khác (Thu)"};
        for (String name : incomeNames) {
            Category category = Category.builder()
                    .categoryName(name)
                    .categoryType(CategoryType.INCOME)
                    .accountId(accountId)
                    .build();
            categories.add(categoryRepository.save(category));
        }

        // Danh mục CHI TIÊU
        String[] expenseNames = {"Ăn uống", "Di chuyển", "Mua sắm", "Giải trí", "Học tập", 
                                  "Sức khỏe", "Hóa đơn", "Tiết kiệm", "Khác (Chi)"};
        for (String name : expenseNames) {
            Category category = Category.builder()
                    .categoryName(name)
                    .categoryType(CategoryType.EXPENSE)
                    .accountId(accountId)
                    .build();
            categories.add(categoryRepository.save(category));
        }

        log.info("Created {} categories for account: {}", categories.size(), accountId);
        return categories;
    }

    /**
     * Tạo lịch sử giao dịch mẫu cho 6 tháng gần nhất
     */
    private int seedTransactionHistory(String accountId, List<Category> categories) {
        // Tách categories theo loại
        List<Category> incomeCategories = categories.stream()
                .filter(c -> c.getCategoryType() == CategoryType.INCOME)
                .toList();
        List<Category> expenseCategories = categories.stream()
                .filter(c -> c.getCategoryType() == CategoryType.EXPENSE)
                .toList();

        if (incomeCategories.isEmpty() || expenseCategories.isEmpty()) {
            log.warn("No categories found for seeding transactions");
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        List<TransactionHistory> transactions = new ArrayList<>();

        // Tạo giao dịch cho 6 tháng gần nhất
        for (int monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
            LocalDateTime monthStart = now.minusMonths(monthsAgo).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            
            // Tạo 15-25 giao dịch thu nhập mỗi tháng
            int incomeCount = 15 + random.nextInt(11);
            for (int i = 0; i < incomeCount; i++) {
                Category category = incomeCategories.get(random.nextInt(incomeCategories.size()));
                BigDecimal amount = generateAmount(category.getCategoryName());
                LocalDateTime transactionDate = generateRandomDateInMonth(monthStart);
                
                TransactionHistory transaction = TransactionHistory.builder()
                        .id(UUID.randomUUID().toString())
                        .toAccountId(accountId)
                        .fromAccountId("EXTERNAL")
                        .amount(amount)
                        .transactionType(TransactionType.DEPOSIT)
                        .status(TransactionStatus.APPROVED)
                        .categoryId(category.getCategoryId().toString())
                        .createdAt(transactionDate)
                        .completedAt(transactionDate.plusMinutes(random.nextInt(60)))
                        .build();
                transactions.add(transaction);
            }

            // Tạo 20-35 giao dịch chi tiêu mỗi tháng
            int expenseCount = 20 + random.nextInt(16);
            for (int i = 0; i < expenseCount; i++) {
                Category category = expenseCategories.get(random.nextInt(expenseCategories.size()));
                BigDecimal amount = generateExpenseAmount(category.getCategoryName());
                LocalDateTime transactionDate = generateRandomDateInMonth(monthStart);
                
                TransactionHistory transaction = TransactionHistory.builder()
                        .id(UUID.randomUUID().toString())
                        .fromAccountId(accountId)
                        .toAccountId("EXTERNAL")
                        .amount(amount)
                        .transactionType(TransactionType.WITHDRAWAL)
                        .status(TransactionStatus.APPROVED)
                        .categoryId(category.getCategoryId().toString())
                        .createdAt(transactionDate)
                        .completedAt(transactionDate.plusMinutes(random.nextInt(60)))
                        .build();
                transactions.add(transaction);
            }

            // Tạo 2-5 giao dịch chuyển khoản mỗi tháng
            int transferCount = 2 + random.nextInt(4);
            for (int i = 0; i < transferCount; i++) {
                Category category = expenseCategories.get(random.nextInt(expenseCategories.size()));
                BigDecimal amount = BigDecimal.valueOf(100000 + random.nextInt(900000));
                LocalDateTime transactionDate = generateRandomDateInMonth(monthStart);
                
                TransactionHistory transaction = TransactionHistory.builder()
                        .id(UUID.randomUUID().toString())
                        .fromAccountId(accountId)
                        .toAccountId("OTHER_USER")
                        .amount(amount)
                        .transactionType(TransactionType.TRANSFER)
                        .status(TransactionStatus.APPROVED)
                        .categoryId(category.getCategoryId().toString())
                        .createdAt(transactionDate)
                        .completedAt(transactionDate.plusMinutes(random.nextInt(60)))
                        .build();
                transactions.add(transaction);
            }
        }

        // Lưu tất cả transactions
        transactionHistoryRepository.saveAll(transactions);
        log.info("Created {} transactions for account: {}", transactions.size(), accountId);
        return transactions.size();
    }

    /**
     * Sinh số tiền thu nhập dựa trên loại danh mục
     */
    private BigDecimal generateAmount(String categoryName) {
        return switch (categoryName) {
            case "Lương" -> BigDecimal.valueOf(10000000 + random.nextInt(20000000)); // 10-30 triệu
            case "Thưởng" -> BigDecimal.valueOf(2000000 + random.nextInt(8000000));  // 2-10 triệu
            case "Đầu tư" -> BigDecimal.valueOf(500000 + random.nextInt(5000000));   // 500k-5.5 triệu
            case "Freelance" -> BigDecimal.valueOf(1000000 + random.nextInt(4000000)); // 1-5 triệu
            case "Cho thuê" -> BigDecimal.valueOf(3000000 + random.nextInt(7000000)); // 3-10 triệu
            default -> BigDecimal.valueOf(100000 + random.nextInt(1000000)); // 100k-1.1 triệu
        };
    }

    /**
     * Sinh số tiền chi tiêu dựa trên loại danh mục
     */
    private BigDecimal generateExpenseAmount(String categoryName) {
        return switch (categoryName) {
            case "Ăn uống" -> BigDecimal.valueOf(30000 + random.nextInt(200000));    // 30k-230k
            case "Di chuyển" -> BigDecimal.valueOf(20000 + random.nextInt(100000));  // 20k-120k
            case "Mua sắm" -> BigDecimal.valueOf(100000 + random.nextInt(2000000));  // 100k-2.1 triệu
            case "Giải trí" -> BigDecimal.valueOf(50000 + random.nextInt(500000));   // 50k-550k
            case "Học tập" -> BigDecimal.valueOf(200000 + random.nextInt(3000000));  // 200k-3.2 triệu
            case "Sức khỏe" -> BigDecimal.valueOf(100000 + random.nextInt(1000000)); // 100k-1.1 triệu
            case "Hóa đơn" -> BigDecimal.valueOf(200000 + random.nextInt(2000000));  // 200k-2.2 triệu
            case "Tiết kiệm" -> BigDecimal.valueOf(1000000 + random.nextInt(5000000)); // 1-6 triệu
            default -> BigDecimal.valueOf(50000 + random.nextInt(500000)); // 50k-550k
        };
    }

    /**
     * Sinh ngày ngẫu nhiên trong tháng
     */
    private LocalDateTime generateRandomDateInMonth(LocalDateTime monthStart) {
        int daysInMonth = monthStart.toLocalDate().lengthOfMonth();
        int randomDay = 1 + random.nextInt(daysInMonth);
        int randomHour = random.nextInt(24);
        int randomMinute = random.nextInt(60);
        
        return monthStart
                .withDayOfMonth(Math.min(randomDay, daysInMonth))
                .withHour(randomHour)
                .withMinute(randomMinute);
    }
}
