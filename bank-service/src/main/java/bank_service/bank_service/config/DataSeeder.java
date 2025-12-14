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
        
        // Kiểm tra account có tồn tại không
        if (!accountRepository.existsById(accountId)) {
            throw new RuntimeException("Account not found: " + accountId);
        }
        
        try {
            // 1. Tạo Categories nếu chưa có
            List<Category> categories = seedCategories(accountId);
            
            // 2. Tạo Transaction History
            int transactionCount = seedTransactionHistory(accountId, categories);
            
            return "Created " + categories.size() + " categories and " + transactionCount + " transactions for account: " + accountId;
        } catch (Exception e) {
            log.error("Error seeding data for account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to seed data for account " + accountId + ": " + e.getMessage(), e);
        }
    }

    /**
     * Tạo các danh mục mẫu cho user - Phù hợp với dự án hiện tại
     */
    private List<Category> seedCategories(String accountId) {
        List<Category> existingCategories = categoryRepository.findByAccountId(accountId);
        
        if (!existingCategories.isEmpty()) {
            log.info("Categories already exist for account: {}, using existing categories", accountId);
            return existingCategories;
        }

        List<Category> categories = new ArrayList<>();

        // Danh mục THU NHẬP - Phù hợp với dự án
        String[] incomeNames = {"Lương", "Thưởng", "Đầu tư", "Freelance", "Cho thuê", "Thu nhập khác"};
        for (String name : incomeNames) {
            Category category = Category.builder()
                    .categoryName(name)
                    .categoryType(CategoryType.INCOME)
                    .accountId(accountId)
                    .build();
            categories.add(categoryRepository.save(category));
        }

        // Danh mục CHI TIÊU - Phù hợp với dự án (7 categories như đã định nghĩa)
        String[] expenseNames = {
            "Cá nhân",           // 👤
            "Mua sắm – Dịch vụ", // 🛒
            "Công việc",         // 💼
            "Giáo dục",          // 🎓
            "Y tế",              // 🏥
            "Sinh hoạt",         // 🏠
            "Khác"               // 📦
        };
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
     * Tạo lịch sử giao dịch mẫu cho 12 tháng gần nhất
     * Tạo data đều cho cả 12 tháng (từ tháng hiện tại trở về 11 tháng trước)
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

        // Tạo giao dịch cho 12 tháng gần nhất
        // monthsAgo = 0: tháng hiện tại
        // monthsAgo = 1: 1 tháng trước
        // ...
        // monthsAgo = 11: 11 tháng trước
        for (int monthsAgo = 0; monthsAgo < 12; monthsAgo++) {
            // Tính tháng cần seed: lấy tháng hiện tại rồi trừ đi số tháng
            LocalDateTime targetMonth = now.minusMonths(monthsAgo);
            
            // Tính thời điểm bắt đầu của tháng (ngày 1, 00:00:00)
            LocalDateTime monthStart = LocalDateTime.of(
                    targetMonth.getYear(),
                    targetMonth.getMonth(),
                    1,
                    0, 0, 0
            );
            
            // Tính số ngày trong tháng
            int daysInMonth = monthStart.toLocalDate().lengthOfMonth();
            
            // Tính thời điểm kết thúc của tháng (ngày cuối, 23:59:59)
            LocalDateTime monthEnd = LocalDateTime.of(
                    targetMonth.getYear(),
                    targetMonth.getMonth(),
                    daysInMonth,
                    23, 59, 59
            );
            
            log.info("Seeding transactions for month {} ({} to {})", 
                    monthsAgo == 0 ? "current" : monthsAgo + " months ago",
                    monthStart.toLocalDate(), 
                    monthEnd.toLocalDate());
            
            int monthIncomeCount = 0;
            int monthExpenseCount = 0;
            int monthTransferCount = 0;
            
            // Tạo 15-25 giao dịch thu nhập mỗi tháng
            int incomeCount = 15 + random.nextInt(11); // 15-25 transactions
            for (int i = 0; i < incomeCount; i++) {
                Category category = incomeCategories.get(random.nextInt(incomeCategories.size()));
                BigDecimal amount = generateAmount(category.getCategoryName());
                LocalDateTime transactionDate = generateRandomDateInMonth(monthStart, monthEnd);
                
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
                monthIncomeCount++;
            }

            // Tạo 20-35 giao dịch chi tiêu mỗi tháng
            int expenseCount = 20 + random.nextInt(16); // 20-35 transactions
            for (int i = 0; i < expenseCount; i++) {
                Category category = expenseCategories.get(random.nextInt(expenseCategories.size()));
                BigDecimal amount = generateExpenseAmount(category.getCategoryName());
                LocalDateTime transactionDate = generateRandomDateInMonth(monthStart, monthEnd);
                
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
                monthExpenseCount++;
            }

            // Tạo 2-5 giao dịch chuyển khoản mỗi tháng
            int transferCount = 2 + random.nextInt(4); // 2-5 transactions
            for (int i = 0; i < transferCount; i++) {
                Category category = expenseCategories.get(random.nextInt(expenseCategories.size()));
                BigDecimal amount = BigDecimal.valueOf(100000 + random.nextInt(900000)); // 100k-1 triệu
                LocalDateTime transactionDate = generateRandomDateInMonth(monthStart, monthEnd);
                
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
                monthTransferCount++;
            }
            
                log.info("Created {} transactions for month {}: {} income, {} expense, {} transfer", 
                    monthIncomeCount + monthExpenseCount + monthTransferCount,
                    monthsAgo == 0 ? "current" : monthsAgo + " months ago",
                    monthIncomeCount, monthExpenseCount, monthTransferCount);
        }

        // Lưu tất cả transactions
            transactionHistoryRepository.saveAll(transactions);
            log.info("Total created {} transactions for account: {} (distributed across 12 months)", 
                transactions.size(), accountId);
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
     * Sinh số tiền chi tiêu dựa trên loại danh mục - Phù hợp với categories mới
     */
    private BigDecimal generateExpenseAmount(String categoryName) {
        return switch (categoryName) {
            case "Cá nhân" -> BigDecimal.valueOf(50000 + random.nextInt(500000));        // 50k-550k (chi phí cá nhân)
            case "Mua sắm – Dịch vụ" -> BigDecimal.valueOf(100000 + random.nextInt(3000000)); // 100k-3.1 triệu (mua sắm)
            case "Công việc" -> BigDecimal.valueOf(200000 + random.nextInt(2000000));     // 200k-2.2 triệu (chi phí công việc)
            case "Giáo dục" -> BigDecimal.valueOf(300000 + random.nextInt(5000000));     // 300k-5.3 triệu (học phí, sách vở)
            case "Y tế" -> BigDecimal.valueOf(150000 + random.nextInt(2000000));         // 150k-2.15 triệu (khám bệnh, thuốc)
            case "Sinh hoạt" -> BigDecimal.valueOf(200000 + random.nextInt(3000000));     // 200k-3.2 triệu (tiền nhà, điện nước)
            case "Khác" -> BigDecimal.valueOf(50000 + random.nextInt(1000000));            // 50k-1.05 triệu
            // Fallback cho categories cũ nếu có
            case "Ăn uống" -> BigDecimal.valueOf(30000 + random.nextInt(200000));
            case "Di chuyển" -> BigDecimal.valueOf(20000 + random.nextInt(100000));
            case "Mua sắm" -> BigDecimal.valueOf(100000 + random.nextInt(2000000));
            case "Giải trí" -> BigDecimal.valueOf(50000 + random.nextInt(500000));
            case "Học tập" -> BigDecimal.valueOf(200000 + random.nextInt(3000000));
            case "Sức khỏe" -> BigDecimal.valueOf(100000 + random.nextInt(1000000));
            case "Hóa đơn" -> BigDecimal.valueOf(200000 + random.nextInt(2000000));
            default -> BigDecimal.valueOf(50000 + random.nextInt(500000)); // 50k-550k
        };
    }

    /**
     * Sinh ngày ngẫu nhiên trong khoảng thời gian của tháng
     * Phân bố đều từ đầu tháng đến cuối tháng
     * @param monthStart Thời điểm bắt đầu tháng (ngày 1, 00:00:00)
     * @param monthEnd Thời điểm kết thúc tháng (ngày cuối, 23:59:59)
     * @return Ngày giờ ngẫu nhiên trong khoảng thời gian đó
     */
    private LocalDateTime generateRandomDateInMonth(LocalDateTime monthStart, LocalDateTime monthEnd) {
        // Tính số ngày trong tháng
        int daysInMonth = monthStart.toLocalDate().lengthOfMonth();
        
        // Sinh ngày ngẫu nhiên (từ 1 đến số ngày trong tháng)
        int randomDay = 1 + random.nextInt(daysInMonth);
        
        // Sinh giờ và phút ngẫu nhiên
        int randomHour = random.nextInt(24);
        int randomMinute = random.nextInt(60);
        int randomSecond = random.nextInt(60);
        
        // Tạo LocalDateTime với ngày, giờ, phút, giây ngẫu nhiên
        return LocalDateTime.of(
                monthStart.getYear(),
                monthStart.getMonth(),
                randomDay,
                randomHour,
                randomMinute,
                randomSecond
        );
    }
}
