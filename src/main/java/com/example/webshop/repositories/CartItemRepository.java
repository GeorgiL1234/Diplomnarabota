package com.example.webshop.repositories;

import com.example.webshop.models.CartItem;
import com.example.webshop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);

    void deleteByUser(User user);
}
