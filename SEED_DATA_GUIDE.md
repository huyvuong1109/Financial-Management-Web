# 📊 Hướng dẫn Seed Data cho Report

## Mục đích
Sinh dữ liệu mẫu (Categories và Transactions) để phần báo cáo tài chính có dữ liệu hiển thị.

---

## 📋 Yêu cầu trước khi chạy

1. **Java 17 hoặc 21** (kiểm tra bằng `java -version`)
2. **MySQL đang chạy** với database `bank_service`
3. **Đã có ít nhất 1 tài khoản USER** trong hệ thống (đăng ký trước)
4. **Đã có tài khoản ADMIN** để gọi API seed

---

## 🚀 Các bước thực hiện

### Bước 1: Pull code mới nhất
```bash
git pull origin main
```

### Bước 2: Khởi động các services cần thiết

**Nếu dùng Docker:**
```bash
docker-compose up -d mysql redis artemis
```

**Nếu chạy MySQL local:** Đảm bảo MySQL đang chạy trên port 3306

### Bước 3: Chạy bank-service

```bash
cd bank-service

# Windows
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"

# Linux/Mac
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Chờ đến khi thấy:
```
Started BankServiceApplication in X.XXX seconds
```

### Bước 4: Đăng nhập với tài khoản ADMIN

Gọi API login để lấy token:

```http
POST http://localhost:8080/bankservice/api/auth/login
Content-Type: application/json

{
    "email": "admin@gmail.com",
    "password": "admin123"
}
```

**Response sẽ trả về token**, copy token này.

### Bước 5: Gọi API Seed Data

**Dùng Postman hoặc cURL:**

```bash
curl -X POST http://localhost:8080/bankservice/api/admin/seed-data \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Hoặc trong Postman:**
- Method: `POST`
- URL: `http://localhost:8080/bankservice/api/admin/seed-data`
- Headers:
  - `Authorization`: `Bearer <token_từ_bước_4>`

### Bước 6: Kiểm tra kết quả

Response thành công:
```json
{
    "status": "success",
    "message": "Successfully seeded data for X users"
}
```

---

## 📊 Dữ liệu được tạo

Cho mỗi user (trừ admin):

| Loại | Chi tiết |
|------|----------|
| **Categories Thu nhập** | Lương, Thưởng, Đầu tư, Freelance, Cho thuê, Khác (Thu) |
| **Categories Chi tiêu** | Ăn uống, Di chuyển, Mua sắm, Giải trí, Học tập, Sức khỏe, Hóa đơn, Tiết kiệm, Khác (Chi) |
| **Transactions** | ~400-700 giao dịch cho 12 tháng gần nhất |

---

## 🔧 API Endpoints mới

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/api/admin/seed-data` | Seed data cho tất cả users |
| POST | `/api/admin/seed-data/{accountId}` | Seed data cho 1 user cụ thể |

---

## ❗ Lưu ý quan trọng

1. **Chỉ cần chạy 1 lần** - Nếu chạy lại sẽ tạo thêm transactions mới
2. **Cần có user trước** - Đăng ký ít nhất 1 tài khoản user trước khi seed
3. **Chỉ ADMIN mới seed được** - API yêu cầu quyền ADMIN
4. **Timestamps:** `TransactionHistory` không nên dùng `@CreationTimestamp`/`@UpdateTimestamp` vì sẽ ghi đè `createdAt`/`completedAt` do seeder cung cấp. Nếu bạn gặp tình trạng "tất cả giao dịch đều cùng tháng", hãy kiểm tra model và đảm bảo các trường thời gian được lưu chính xác.

---

## 🐛 Troubleshooting

### Lỗi 403 Forbidden
→ Token không có quyền ADMIN, kiểm tra lại tài khoản

### Lỗi 401 Unauthorized  
→ Token hết hạn hoặc sai, đăng nhập lại

### "No accounts found"
→ Chưa có user nào trong hệ thống, đăng ký user trước

### Lỗi kết nối database
→ Kiểm tra MySQL đang chạy và cấu hình đúng trong `application-local.yaml`

---

## ✅ Sau khi seed xong

Đăng nhập với tài khoản USER và vào phần **Báo cáo** để xem dữ liệu:
- Báo cáo thu/chi theo tháng
- Biểu đồ chi tiêu theo danh mục
- Báo cáo dòng tiền
- Tổng hợp tài chính

🎉 Done!
