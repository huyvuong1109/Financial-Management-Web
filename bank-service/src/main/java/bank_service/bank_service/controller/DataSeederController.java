package bank_service.bank_service.controller;

import bank_service.bank_service.config.DataSeeder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller để seed dữ liệu mẫu cho báo cáo
 * Chỉ ADMIN mới có quyền gọi API này
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DataSeederController {

    private final DataSeeder dataSeeder;

    /**
     * Seed dữ liệu cho tất cả users (trừ admin)
     * POST /bankservice/api/admin/seed-data
     */
    @PostMapping("/seed-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> seedAllData() {
        String result = dataSeeder.seedAllUsers();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", result
        ));
    }

    /**
     * Seed dữ liệu cho một user cụ thể
     * POST /bankservice/api/admin/seed-data/{accountId}
     */
    @PostMapping("/seed-data/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> seedDataForAccount(@PathVariable String accountId) {
        String result = dataSeeder.seedForAccount(accountId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", result
        ));
    }
}
