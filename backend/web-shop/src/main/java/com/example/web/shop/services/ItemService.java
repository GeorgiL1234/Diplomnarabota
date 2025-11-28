package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.models.User;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    @Autowired
    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // --- Създаване на нова обява ---
    public Item createItem(String title, String description, Double price, String imageUrl, User user) {
        Item item = new Item(title, description, price, imageUrl, user);
        return itemRepository.save(item);
    }

    // --- Връща всички обяви ---
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // --- Връща всички обяви на конкретен потребител ---
    public List<Item> getItemsByUser(User user) {
        return itemRepository.findByUser(user);
    }

    // --- Търсене на обяви по ключова дума в заглавието ---
    public List<Item> searchItemsByTitle(String keyword) {
        return itemRepository.findByTitleContainingIgnoreCase(keyword);
    }

    // --- Намиране на обява по ID ---
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }
}
