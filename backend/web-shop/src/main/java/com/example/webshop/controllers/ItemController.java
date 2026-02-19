package com.example.webshop.controllers;

import com.example.webshop.config.JsonViews;
import com.example.webshop.dto.ItemListDto;
import com.example.webshop.models.Item;
import com.example.webshop.services.ItemService;
import com.fasterxml.jackson.annotation.JsonView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
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
    @JsonView(JsonViews.WithImage.class)
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
            if (item.getDescription().trim().length() < 40) {
                logger.error("Create item attempt with description too short: {} chars", item.getDescription().length());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Description must be at least 40 characters");
            }
            
            if (item.getPrice() <= 0) {
                logger.error("Create item attempt with invalid price: {}", item.getPrice());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Price must be greater than 0");
            }
            
            if (item.getOwnerEmail() == null || item.getOwnerEmail().trim().isEmpty()) {
                logger.error("Create item attempt without ownerEmail");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Owner email is required");
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

    /** Health check – използвай /items/health-check (не /ping – конфликт с /{id}) */
    @GetMapping({ "/ping", "/health-check" })
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("OK");
    }

    /** Версия на backend */
    @GetMapping("/version")
    public ResponseEntity<java.util.Map<String, String>> version() {
        return ResponseEntity.ok(java.util.Map.of("build", "v3-feb2026"));
    }

    @GetMapping
    @JsonView(JsonViews.WithImage.class)
    public List<Item> getAll() {
        return itemService.getAll();
    }

    /** Списък БЕЗ imageUrl – за list view (избягва 500 на Render от големи base64) */
    @GetMapping("/list")
    public List<ItemListDto> getList() {
        return itemService.getAllForList();
    }

    /** Детайли БЕЗ imageUrl – избягва timeout/500 от големи base64. Снимката се взима от /items/{id}/image */
    @GetMapping("/{id:[0-9]+}")
    public Item getById(@PathVariable Long id) {
        return itemService.getById(id);
    }

    /** JSON с imageUrl – за URL снимки (seed). За base64 използвай /image/raw */
    @GetMapping("/{id:[0-9]+}/image")
    public ResponseEntity<java.util.Map<String, String>> getImage(@PathVariable Long id) {
        Item item = itemService.getById(id);
        if (item.getImageUrl() == null || item.getImageUrl().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(java.util.Map.of("imageUrl", item.getImageUrl()));
    }

    /** Raw bytes – за base64 снимки (user upload). Избягва големи JSON отговори */
    @GetMapping("/{id:[0-9]+}/image/raw")
    public ResponseEntity<byte[]> getImageRaw(@PathVariable Long id) {
        Item item = itemService.getById(id);
        String url = item.getImageUrl();
        if (url == null || url.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (url.startsWith("data:")) {
            try {
                int comma = url.indexOf(',');
                if (comma < 0) return ResponseEntity.badRequest().build();
                String base64 = url.substring(comma + 1).replaceAll("\\s", "");
                byte[] bytes = Base64.getDecoder().decode(base64);
                if (bytes == null || bytes.length == 0) return ResponseEntity.notFound().build();
                String mime = "image/jpeg";
                if (url.startsWith("data:image/png")) mime = "image/png";
                else if (url.startsWith("data:image/gif")) mime = "image/gif";
                else if (url.startsWith("data:image/webp")) mime = "image/webp";
                HttpHeaders headers = new HttpHeaders();
                headers.setCacheControl("public, max-age=3600");
                return ResponseEntity.ok().contentType(MediaType.parseMediaType(mime)).headers(headers).body(bytes);
            } catch (Exception e) {
                logger.warn("Failed to decode base64 image for item {}: {}", id, e.getMessage());
                return ResponseEntity.notFound().build();
            }
        }
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return ResponseEntity.status(HttpStatus.FOUND).location(java.net.URI.create(url)).build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id:[0-9]+}")
    public Item update(
            @PathVariable Long id,
            @RequestBody Item item) {
        return itemService.update(id, item);
    }

    @DeleteMapping("/{id:[0-9]+}")
    public void delete(@PathVariable Long id) {
        itemService.delete(id);
    }
}
