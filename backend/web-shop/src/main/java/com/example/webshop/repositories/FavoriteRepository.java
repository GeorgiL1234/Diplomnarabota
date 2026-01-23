package com.example.webshop.repositories;

import com.example.webshop.models.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserEmailOrderByIdDesc(String userEmail);

    Optional<Favorite> findByUserEmailAndItemId(String userEmail, Long itemId);

    void deleteByUserEmailAndItemId(String userEmail, Long itemId);
}
