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
            logger.info("Register attempt for email: {}", user.getEmail());
            userService.register(user.getEmail(), user.getPassword(), user.getFullName());
            logger.info("Registration successful for email: {}", user.getEmail());
            return ResponseEntity.ok("REGISTER_OK");
        } catch (Exception e) {
            logger.error("Registration failed for email: {}", user.getEmail(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            logger.info("Login attempt for email: {}", user.getEmail());
            userService.login(user.getEmail(), user.getPassword());
            logger.info("Login successful for email: {}", user.getEmail());
            return ResponseEntity.ok("LOGIN_OK");
        } catch (Exception e) {
            logger.error("Login failed for email: {}", user.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }
}
