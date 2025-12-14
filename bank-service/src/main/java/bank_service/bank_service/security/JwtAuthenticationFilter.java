package bank_service.bank_service.security;

import bank_service.bank_service.exception.AppException;
import bank_service.bank_service.repository.AccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.data.redis.core.RedisTemplate;


import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AccountRepository accountRepository;
//    private final RedisTemplate<String, String> redis;
private final StringRedisTemplate redis;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Bỏ qua auth endpoints và public seed-data endpoints
        if (path.startsWith("/bankservice/api/auth") || 
            path.contains("/api/admin/seed-data/public")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String accountId = jwtService.extractAccountId(token);
        String role = jwtService.extractRole(token);
        System.out.println("Token from client: " + token);
        System.out.println("Account ID from token: " + accountId);

        String tokenInRedis = redis.opsForValue().get("token:" + accountId);
        System.out.println("Token in Redis: " + tokenInRedis);

        if (tokenInRedis == null || !tokenInRedis.equals(token)) {
            throw new AppException("Invalid or expired token");
        }

        if (accountId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

            UserDetails userDetails = User
                    .withUsername(accountId)
                    .password("") // không cần mật khẩu
                    .authorities("ROLE_" + role)
                    .build();

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
