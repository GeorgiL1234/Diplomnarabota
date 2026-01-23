package com.example.webshop.services;

import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String email, String password, String fullName) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use!");
        }

        String encodedPassword = passwordEncoder.encode(password);

        User newUser = new User(email, encodedPassword, fullName);
        return userRepository.save(newUser);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }
}
