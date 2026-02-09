package com.example.webshop.controllers;

import com.example.webshop.models.User;
import com.example.webshop.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Валидация на входните данни
            if (user == null) {
                logger.error("Register attempt with null user object");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User data is required");
            }
            
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                logger.error("Register attempt with empty email");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
            }
            
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                logger.error("Register attempt with empty password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password is required");
            }
            
            logger.info("Register attempt for email: {}", user.getEmail());
            long startTime = System.currentTimeMillis();
            userService.register(user.getEmail(), user.getPassword(), user.getFullName());
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Registration successful for email: {} (took {}ms)", user.getEmail(), duration);
            return ResponseEntity.ok("REGISTER_OK");
        } catch (RuntimeException e) {
            logger.error("Registration failed for email: {}", user != null ? user.getEmail() : "unknown", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during registration for email: {}", user != null ? user.getEmail() : "unknown", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            // Валидация на входните данни
            if (user == null) {
                logger.error("Login attempt with null user object");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User data is required");
            }
            
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                logger.error("Login attempt with empty email");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
            }
            
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                logger.error("Login attempt with empty password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password is required");
            }
            
            logger.info("Login attempt for email: {}", user.getEmail());
            userService.login(user.getEmail(), user.getPassword());
            logger.info("Login successful for email: {}", user.getEmail());
            return ResponseEntity.ok("LOGIN_OK");
        } catch (RuntimeException e) {
            logger.error("Login failed for email: {}", user != null ? user.getEmail() : "unknown", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        } catch (Exception e) {
            logger.error("Unexpected error during login for email: {}", user != null ? user.getEmail() : "unknown", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }
}
