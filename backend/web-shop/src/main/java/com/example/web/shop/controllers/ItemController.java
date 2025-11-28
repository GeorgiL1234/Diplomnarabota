package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.models.User;
import com.example.webshop.services.ItemService;
import com.example.webshop.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;
    private final UserService userService;

    @Autowired
    public ItemController(ItemService itemService, UserService userService) {
        this.itemService = itemService;
        this.userService = userService;
    }

    // --- Публикуване на нова обява ---
    @PostMapping("/create")
    public ResponseEntity<?> createItem(@RequestParam String title,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam(required = false) String imageUrl,
            @RequestParam Long userId) {

        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Невалиден потребител!");
        }

        Item item = itemService.createItem(title, description, price, imageUrl, userOpt.get());
        return ResponseEntity.ok(item);
    }

    // --- Връща всички обяви ---
    @GetMapping("/all")
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    // --- Връща обяви на конкретен потребител ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getItemsByUser(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Невалиден потребител!");
        }
        List<Item> items = itemService.getItemsByUser(userOpt.get());
        return ResponseEntity.ok(items);
    }

    // --- Търсене на обяви по ключова дума в заглавието ---
    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchItems(@RequestParam String keyword) {
        return ResponseEntity.ok(itemService.searchItemsByTitle(keyword));
    }
}
