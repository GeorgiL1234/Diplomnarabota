package com.example.webshop.repositories;

import com.example.webshop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // Казваме на Spring, че това е репозитори
public interface UserRepository extends JpaRepository<User, Long> {

    // Метод за търсене на потребител по email
    Optional<User> findByEmail(String email);

    // Метод за проверка дали email вече съществува
    boolean existsByEmail(String email);
}
