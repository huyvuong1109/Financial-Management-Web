package bank_service.bank_service.controller;

import bank_service.bank_service.config.DataSeeder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller để seed dữ liệu mẫu cho báo cáo
 * 
 * Endpoints:
 * - POST /bankservice/api/admin/seed-data (yêu cầu ADMIN role)
 * - POST /bankservice/api/admin/seed-data/{accountId} (yêu cầu ADMIN role)
 * - POST /bankservice/api/admin/seed-data/public (không cần auth - cho dev/test)
 * - POST /bankservice/api/admin/seed-data/public/{accountId} (không cần auth - cho dev/test)
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DataSeederController {

    private final DataSeeder dataSeeder;

    /**
     * Seed dữ liệu cho tất cả users (trừ admin)
     * POST /bankservice/api/admin/seed-data
     * Yêu cầu: ADMIN role
     */
    @PostMapping("/seed-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> seedAllData() {
        try {
            String result = dataSeeder.seedAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", result);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to seed data: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Seed dữ liệu cho một user cụ thể
     * POST /bankservice/api/admin/seed-data/{accountId}
     * Yêu cầu: ADMIN role
     */
    @PostMapping("/seed-data/{accountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> seedDataForAccount(@PathVariable String accountId) {
        try {
            String result = dataSeeder.seedForAccount(accountId);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", result);
            response.put("accountId", accountId);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to seed data for account: " + e.getMessage());
            errorResponse.put("accountId", accountId);
            errorResponse.put("error", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Seed dữ liệu cho tất cả users - PUBLIC ENDPOINT (không cần auth)
     * POST /bankservice/api/admin/seed-data/public
     * Dùng cho dev/test - KHÔNG CẦN AUTHENTICATION
     */
    @PostMapping("/seed-data/public")
    public ResponseEntity<Map<String, Object>> seedAllDataPublic() {
        try {
            String result = dataSeeder.seedAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", result);
            response.put("note", "This is a public endpoint for development/testing");
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to seed data: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            if (e.getStackTrace().length > 0) {
                errorResponse.put("stackTrace", e.getStackTrace()[0].toString());
            }
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Seed dữ liệu cho một user cụ thể - PUBLIC ENDPOINT (không cần auth)
     * POST /bankservice/api/admin/seed-data/public/{accountId}
     * Dùng cho dev/test - KHÔNG CẦN AUTHENTICATION
     */
    @PostMapping("/seed-data/public/{accountId}")
    public ResponseEntity<Map<String, Object>> seedDataForAccountPublic(@PathVariable String accountId) {
        try {
            String result = dataSeeder.seedForAccount(accountId);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", result);
            response.put("accountId", accountId);
            response.put("note", "This is a public endpoint for development/testing");
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to seed data for account: " + e.getMessage());
            errorResponse.put("accountId", accountId);
            errorResponse.put("error", e.getClass().getSimpleName());
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            if (e.getStackTrace().length > 0) {
                errorResponse.put("stackTrace", e.getStackTrace()[0].toString());
            }
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
