package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.services.ItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);
    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Item item) {
        try {
            // Валидация на входните данни
            if (item == null) {
                logger.error("Create item attempt with null item object");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Item data is required");
            }
            
            if (item.getTitle() == null || item.getTitle().trim().isEmpty()) {
                logger.error("Create item attempt with empty title");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Title is required");
            }
            
            if (item.getDescription() == null || item.getDescription().trim().isEmpty()) {
                logger.error("Create item attempt with empty description");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Description is required");
            }
            
            if (item.getPrice() <= 0) {
                logger.error("Create item attempt with invalid price: {}", item.getPrice());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Price must be greater than 0");
            }
            
            logger.info("Creating item: title={}, ownerEmail={}, category={}", 
                    item.getTitle(), item.getOwnerEmail(), item.getCategory());
            
            Item createdItem = itemService.create(item);
            logger.info("Item created successfully with ID: {}", createdItem.getId());
            
            return ResponseEntity.ok(createdItem);
        } catch (RuntimeException e) {
            logger.error("Error creating item", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create item: " + e.getMessage());
        }
    }

    /** Прост health check - ако /items работи, и това работи */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping
    public List<Item> getAll() {
        return itemService.getAll();
    }

    @GetMapping("/{id}")
    public Item getById(@PathVariable Long id) {
        return itemService.getById(id);
    }

    @PutMapping("/{id}")
    public Item update(
            @PathVariable Long id,
            @RequestBody Item item) {
        return itemService.update(id, item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        itemService.delete(id);
    }
}
