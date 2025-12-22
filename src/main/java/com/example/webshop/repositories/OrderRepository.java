package com.example.webshop.repositories;

import com.example.webshop.models.Order;
import com.example.webshop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
}
