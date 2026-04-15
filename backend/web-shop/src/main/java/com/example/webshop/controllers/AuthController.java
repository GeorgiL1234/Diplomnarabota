package com.example.webshop.controllers;

import com.example.webshop.config.JwtUtil;
import com.example.webshop.dto.AuthResponse;
import com.example.webshop.exception.ApiException;
import com.example.webshop.models.User;
import com.example.webshop.services.UserService;
import com.example.webshop.validation.EmailValidation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /** Лека заявка за "подгряване" на Render.com - предотвратява cold start при login/register */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        if (user == null) {
            logger.error("Register attempt with null user object");
            throw new ApiException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        String email = EmailValidation.trim(user.getEmail());
        if (email.isEmpty()) {
            logger.error("Register attempt with empty email");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!EmailValidation.isValid(email)) {
            logger.error("Register attempt with invalid email format");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            logger.error("Register attempt with empty password");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        logger.info("Register attempt for email: {}", email);
        long startTime = System.currentTimeMillis();
        userService.register(email, user.getPassword(), user.getFullName());
        long duration = System.currentTimeMillis() - startTime;
        logger.info("Registration successful for email: {} (took {}ms)", email, duration);
        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(new AuthResponse(token, "Bearer", email));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User user) {
        if (user == null) {
            logger.error("Login attempt with null user object");
            throw new ApiException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        String email = EmailValidation.trim(user.getEmail());
        if (email.isEmpty()) {
            logger.error("Login attempt with empty email");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!EmailValidation.isValid(email)) {
            logger.error("Login attempt with invalid email format");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            logger.error("Login attempt with empty password");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        logger.info("Login attempt for email: {}", email);
        userService.login(email, user.getPassword());
        logger.info("Login successful for email: {}", email);
        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(new AuthResponse(token, "Bearer", email));
    }

    /** Проверка на JWT – връща email на текущия потребител (за демонстрация на stateless security). */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of("email", authentication.getName()));
    }
}
