package com.example.webshop.services;

import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); // за криптиране на пароли
    }

    // --- Регистрация на нов потребител ---
    public User registerUser(String username, String email, String password) {
        if(userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email вече съществува!");
        }

        // Криптиране на паролата
        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(username, email, encodedPassword);
        return userRepository.save(user);
    }

    // --- Вход на потребител ---
    public Optional<User> loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if(userOpt.isPresent()) {
            User user = userOpt.get();
            if(passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty(); // ако email или password не съвпадат
    }

    // --- Търсене на потребител по ID ---
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
