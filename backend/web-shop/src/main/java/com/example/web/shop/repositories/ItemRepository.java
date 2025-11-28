package com.example.webshop.repositories;

import com.example.webshop.models.Item;
import com.example.webshop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    // Връща всички обяви, публикувани от конкретен потребител
    List<Item> findByUser(User user);

    // Можем да добавим други методи за търсене по цена, заглавие и т.н.
    List<Item> findByTitleContainingIgnoreCase(String keyword);
}
