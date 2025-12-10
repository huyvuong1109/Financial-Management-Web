package bank_service.bank_service.service;

import bank_service.bank_service.dto.CardFullInfoDTO;
import bank_service.bank_service.dto.CardWithUsernameDTO;
import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.model.*;
import bank_service.bank_service.repository.AccountRepository;
import bank_service.bank_service.repository.BalanceRepository;
import bank_service.bank_service.repository.CardRepository;
import bank_service.bank_service.repository.CategoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final RedisTemplate<String, Object> redisTemplate;


    private static final String KEY_CATEGORY_BY_ACCOUNT = "CATEGORY:ACCOUNT:";
    private static final String KEY_CATEGORY_FULLINFO = "CATEGORY:FULLINFO:";
    private static final String CACHE_CATEGORY_WITH_USERNAME = "CATEGORY:WITH_USERNAME";
    private static final String CACHE_CATEGORY_FULL_INFO = "CATEGORY:FULL_INFO";

    private void clearCategoryCache(String id, Long categoryId) {
        redisTemplate.delete(KEY_CATEGORY_BY_ACCOUNT + id);
        redisTemplate.delete(KEY_CATEGORY_FULLINFO + categoryId);
        redisTemplate.delete(CACHE_CATEGORY_WITH_USERNAME);
        redisTemplate.delete(CACHE_CATEGORY_FULL_INFO);
    }

    //tao category moi
    public Optional<Category> createCategory(Category category) {
        Optional<Account> account = accountRepository.findById(category.getAccountId());
        if (account.isEmpty()) return Optional.empty();

        Category saved = categoryRepository.save(category);

        clearCategoryCache(category.getAccountId(), category.getCategoryId());

        return Optional.of(saved);
    }
    //lay all category cua account co id
    public List<Category> getCategoryByAccountId(String id) {
        String redisKey = KEY_CATEGORY_BY_ACCOUNT + id;

        // 1. Check Redis
        List<Category> cachedCategory = (List<Category>) redisTemplate.opsForValue().get(redisKey);
        if (cachedCategory != null) {
            System.out.println("Redis HIT -> getCardsByid({})" + id);
            return cachedCategory;
        }

        // 2. Query DB
        System.out.println("Redis MISS -> getCardsByid({})" + id);
        List<Category> category = categoryRepository.findByAccountId(id);

        // 3. Cache vào Redis (TTL 10 phút)
        redisTemplate.opsForValue().set(redisKey, category, 10, TimeUnit.MINUTES);

        return category;
    }

    // Get category by ID
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Update category
    public Optional<Category> updateCategory(Long id, Category categoryUpdate, String accountId) {
        return categoryRepository.findById(id)
                .filter(category -> category.getAccountId().equals(accountId))
                .map(category -> {
                    category.setCategoryName(categoryUpdate.getCategoryName());
                    category.setCategoryType(categoryUpdate.getCategoryType());
                    Category saved = categoryRepository.save(category);
                    clearCategoryCache(accountId, id);
                    return saved;
                });
    }

    // Delete category
    public boolean deleteCategory(Long id, String accountId) {
        return categoryRepository.findById(id)
                .filter(category -> category.getAccountId().equals(accountId))
                .map(category -> {
                    categoryRepository.delete(category);
                    clearCategoryCache(accountId, id);
                    return true;
                })
                .orElse(false);
    }

    public void createDefaultCategories(String accountId) {
        List<Category> defaultCategories = List.of(
                Category.builder().categoryName("Ăn uống").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Đi lại").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Mua sắm").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Hóa đơn").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Giải trí").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Sức khỏe").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Giáo dục").categoryType(CategoryType.EXPENSE).accountId(accountId).build(),
                Category.builder().categoryName("Lương").categoryType(CategoryType.INCOME).accountId(accountId).build(),
                Category.builder().categoryName("Thưởng").categoryType(CategoryType.INCOME).accountId(accountId).build(),
                Category.builder().categoryName("Đầu tư").categoryType(CategoryType.INCOME).accountId(accountId).build(),
                Category.builder().categoryName("Khác").categoryType(CategoryType.INCOME).accountId(accountId).build()
        );

        categoryRepository.saveAll(defaultCategories);
        clearCategoryCache(accountId, null); // Clear cache for this account
    }
}
