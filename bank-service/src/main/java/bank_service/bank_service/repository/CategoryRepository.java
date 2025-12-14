package bank_service.bank_service.repository;

import bank_service.bank_service.dto.CardWithUsernameDTO;
import bank_service.bank_service.model.Card;
import bank_service.bank_service.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByAccountId(String id);
    Category findByAccountIdAndCategoryName(String accountId, String categoryName);
}
