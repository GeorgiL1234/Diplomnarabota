package com.example.webshop.services;

import com.example.webshop.exception.ApiException;
import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import com.example.webshop.validation.EmailValidation;
import org.springframework.http.HttpStatus;
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
        String e = EmailValidation.trim(email);
        if (!EmailValidation.isValid(e)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }
        logger.info("Starting registration for email: {}", e);
        long startTime = System.currentTimeMillis();
        
        try {
            // Оптимизирана проверка - използваме existsByEmail за по-бърза проверка
            logger.debug("Checking if email exists: {}", e);
            if (userRepository.existsByEmail(e)) {
                logger.warn("Registration failed - email already exists: {}", e);
                throw new ApiException(HttpStatus.CONFLICT, "Email already in use!");
            }
            logger.debug("Email check completed in {}ms", System.currentTimeMillis() - startTime);

            logger.debug("Encoding password for email: {}", e);
            long encodeStart = System.currentTimeMillis();
            String encodedPassword = passwordEncoder.encode(password);
            logger.debug("Password encoded in {}ms", System.currentTimeMillis() - encodeStart);

            User newUser = new User(e, encodedPassword, fullName);
            logger.debug("Creating user object for email: {}", e);
            
            // Използваме save() за по-бързо записване - Spring ще направи flush автоматично при commit
            // Това е по-бързо от saveAndFlush() защото не прави синхронно flush
            logger.debug("Saving user to database...");
            long saveStart = System.currentTimeMillis();
            User saved = userRepository.save(newUser);
            logger.info("User saved successfully with ID: {} in {}ms", saved.getId(), System.currentTimeMillis() - saveStart);
            
            long totalTime = System.currentTimeMillis() - startTime;
            logger.info("Registration completed successfully for email: {} in {}ms", e, totalTime);
            return saved;
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Unexpected error during registration for email: {} after {}ms", e, System.currentTimeMillis() - startTime, ex);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed. Please try again later.", ex);
        }
    }

    public User login(String email, String password) {
        String e = EmailValidation.trim(email);
        if (!EmailValidation.isValid(e)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        logger.debug("Attempting login for email: {}", e);
        User user = userRepository.findByEmail(e)
                .orElseThrow(() -> {
                    logger.warn("User not found for email: {}", e);
                    return new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
                });

        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        logger.debug("Password matches: {}", passwordMatches);
        
        if (!passwordMatches) {
            logger.warn("Password mismatch for email: {}", e);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        logger.info("Login successful for email: {}", e);
        return user;
    }
}
