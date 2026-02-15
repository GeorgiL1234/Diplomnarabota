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
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(6);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = false, timeout = 30)
    public User register(String email, String password, String fullName) {
        logger.info("Starting registration for email: {}", email);
        long startTime = System.currentTimeMillis();
        
        try {
            // Оптимизирана проверка - използваме existsByEmail за по-бърза проверка
            logger.debug("Checking if email exists: {}", email);
            if (userRepository.existsByEmail(email)) {
                logger.warn("Registration failed - email already exists: {}", email);
                throw new RuntimeException("Email already in use!");
            }
            logger.debug("Email check completed in {}ms", System.currentTimeMillis() - startTime);

            logger.debug("Encoding password for email: {}", email);
            long encodeStart = System.currentTimeMillis();
            String encodedPassword = passwordEncoder.encode(password);
            logger.debug("Password encoded in {}ms", System.currentTimeMillis() - encodeStart);

            User newUser = new User(email, encodedPassword, fullName);
            logger.debug("Creating user object for email: {}", email);
            
            // Използваме save() за по-бързо записване - Spring ще направи flush автоматично при commit
            // Това е по-бързо от saveAndFlush() защото не прави синхронно flush
            logger.debug("Saving user to database...");
            long saveStart = System.currentTimeMillis();
            User saved = userRepository.save(newUser);
            logger.info("User saved successfully with ID: {} in {}ms", saved.getId(), System.currentTimeMillis() - saveStart);
            
            long totalTime = System.currentTimeMillis() - startTime;
            logger.info("Registration completed successfully for email: {} in {}ms", email, totalTime);
            return saved;
        } catch (RuntimeException e) {
            logger.error("Registration failed for email: {} after {}ms", email, System.currentTimeMillis() - startTime, e);
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during registration for email: {} after {}ms", email, System.currentTimeMillis() - startTime, e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
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
