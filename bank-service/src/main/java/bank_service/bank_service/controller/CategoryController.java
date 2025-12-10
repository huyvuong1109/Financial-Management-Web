package bank_service.bank_service.controller;

import bank_service.bank_service.dto.CardFullInfoDTO;
import bank_service.bank_service.dto.CardWithUsernameDTO;
import bank_service.bank_service.model.Card;
import bank_service.bank_service.model.Category;
import bank_service.bank_service.service.CardService;
import bank_service.bank_service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        category.setAccountId(accountId); // Gán từ context
        return categoryService.createCategory(category)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body("Account does not exist"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Category>> getCategory() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String accountId = userDetails.getUsername();
        return ResponseEntity.ok(categoryService.getCategoryByAccountId(accountId));
    }
}
