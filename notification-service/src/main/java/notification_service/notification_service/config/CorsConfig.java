package notification_service.notification_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả các endpoint
                .allowedOrigins("http://localhost:5173","http://localhost:8080", "http://localhost") // Chỉ cho phép origin này
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các phương thức
                .allowedHeaders("*") // Cho phép tất cả các header
                .allowCredentials(true); // Quan trọng nếu bạn dùng cookies hoặc token xác thực
    }
}