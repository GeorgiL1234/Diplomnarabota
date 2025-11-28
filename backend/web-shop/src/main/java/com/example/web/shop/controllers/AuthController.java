package com.example.webshop.controllers;

import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import com.example.webshop.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ------------------------
    // REGISTER
    // ------------------------
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {

        Map<String, Object> response = new HashMap<>();

        // Проверка дали имейлът вече съществува
        if (userRepository.findByEmail(user.getEmail()) != null) {
            response.put("error", "Email already exists");
            return response;
        }

        // Криптиране на паролата
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Записване в базата
        userRepository.save(user);

        response.put("message", "User registered successfully");

        return response;
    }

    // ------------------------
    // LOGIN
    // ------------------------
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User loginRequest) {

        Map<String, Object> response = new HashMap<>();

        // Търсим потребителя по email
        User dbUser = userRepository.findByEmail(loginRequest.getEmail());

        if (dbUser == null) {
            response.put("error", "User not found");
            return response;
        }

        // Проверка на паролата
        if (!passwordEncoder.matches(loginRequest.getPassword(), dbUser.getPassword())) {
            response.put("error", "Invalid password");
            return response;
        }

        // Генериране на JWT токен
        String token = jwtUtil.generateToken(dbUser.getEmail());

        response.put("message", "Login successful");
        response.put("token", token);
        response.put("email", dbUser.getEmail());
        response.put("userId", dbUser.getId());

        return response;
    }
}
