package com.example.webshop.services;

import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User register(String email, String password, String fullName) {
        // Оптимизирана проверка - използваме existsByEmail за по-бърза проверка
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use!");
        }

        String encodedPassword = passwordEncoder.encode(password);
        logger.debug("Encoded password for email {}: {}", email, encodedPassword);

        User newUser = new User(email, encodedPassword, fullName);
        // Използваме save() вместо saveAndFlush() за по-добра производителност
        // Spring ще направи flush автоматично при commit на транзакцията
        User saved = userRepository.save(newUser);
        logger.debug("User saved with ID: {}", saved.getId());
        return saved;
    }

    public User login(String email, String password) {
        logger.debug("Attempting login for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("User not found for email: {}", email);
                    return new RuntimeException("Invalid email or password");
                });

        logger.debug("User found, stored password hash: {}", user.getPassword());
        logger.debug("Input password length: {}", password != null ? password.length() : 0);
        
        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        logger.debug("Password matches: {}", passwordMatches);
        
        if (!passwordMatches) {
            logger.warn("Password mismatch for email: {}", email);
            throw new RuntimeException("Invalid email or password");
        }

        logger.info("Login successful for email: {}", email);
        return user;
    }
}
