package bank_service.bank_service.controller;

import bank_service.bank_service.dto.CardFullInfoDTO;
import bank_service.bank_service.dto.CardWithUsernameDTO;
import bank_service.bank_service.model.Card;
import bank_service.bank_service.model.Category;
import bank_service.bank_service.model.CategoryType;
import bank_service.bank_service.service.CardService;
import bank_service.bank_service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        category.setAccountId(accountId);
        return categoryService.createCategory(category)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body("Account does not exist"));
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        return ResponseEntity.ok(categoryService.getCategoryByAccountId(accountId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Category>> getCategory() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        return ResponseEntity.ok(categoryService.getCategoryByAccountId(accountId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Category>> getCategoriesByType(@PathVariable String type) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        CategoryType categoryType = CategoryType.valueOf(type.toUpperCase());
        
        List<Category> categories = categoryService.getCategoryByAccountId(accountId).stream()
                .filter(c -> c.getCategoryType() == categoryType)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        
        return categoryService.updateCategory(id, category, accountId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body("Category not found or unauthorized"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        
        if (categoryService.deleteCategory(id, accountId)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.badRequest().body("Category not found or unauthorized");
    }
}
