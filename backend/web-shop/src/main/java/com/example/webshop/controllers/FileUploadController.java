package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    /**
     * Base directory for file uploads.
     * Uses temp directory on Render.com, falls back to user.dir
     */
    private static String getUploadDir() {
        String tempDir = System.getProperty("java.io.tmpdir");
        if (tempDir != null && !tempDir.isEmpty()) {
            return tempDir + File.separator + "uploads" + File.separator;
        }
        return System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
    }

    private final ItemRepository itemRepository;

    public FileUploadController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @PostMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> uploadImage(
            @PathVariable Long itemId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "ownerEmail", required = false) String ownerEmail) {

        System.out.println("========================================");
        System.out.println(">>> UPLOAD ENDPOINT CALLED <<<");
        System.out.println("Timestamp: " + System.currentTimeMillis());
        System.out.println("Item ID: " + itemId);
        System.out.println("Owner email: " + ownerEmail);
        System.out.println("File object: " + (file != null ? "NOT NULL" : "NULL"));
        
        try {
            // Валидация на входните данни
            if (file == null) {
                System.out.println("ERROR: File is null!");
                return ResponseEntity.badRequest().body("{\"error\":\"File is required\"}");
            }
            
            if (ownerEmail == null || ownerEmail.trim().isEmpty()) {
                System.out.println("ERROR: Owner email is null or empty!");
                return ResponseEntity.badRequest().body("{\"error\":\"Owner email is required\"}");
            }
            
            if (itemId == null) {
                System.out.println("ERROR: Item ID is null!");
                return ResponseEntity.badRequest().body("{\"error\":\"Item ID is required\"}");
            }
            
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize() + " bytes");
            System.out.println("File content type: " + file.getContentType());
            System.out.println("File isEmpty: " + file.isEmpty());

            if (file.isEmpty()) {
                System.out.println("Uploaded file is empty!");
                return ResponseEntity.badRequest().body("{\"error\":\"File is empty\",\"path\":\"/upload/" + itemId + "\"}");
            }

            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

            // Проверка дали потребителят е собственик на обявата
            if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
                System.out.println("Owner mismatch! Item owner: " + item.getOwnerEmail() + ", Request owner: " + ownerEmail);
                return ResponseEntity.status(403).body("You can only upload images to your own listings");
            }

            // На Render.com файловата система е ефемерна, затова директно запазваме като base64
            System.out.println("Saving image as base64 in database (Render.com compatible)...");
            
            byte[] bytes;
            try {
                bytes = file.getBytes();
                System.out.println("File bytes read: " + bytes.length + " bytes");
            } catch (IOException e) {
                System.out.println("ERROR: Failed to read file bytes: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to read file: " + e.getMessage());
            }
            
            // Проверка за размера - H2 TEXT колоната може да съхранява до 2GB, но нека ограничим до 10MB за сигурност
            if (bytes.length > 10 * 1024 * 1024) { // Ако е над 10MB
                System.out.println("ERROR: Image is too large (" + bytes.length + " bytes, max 10MB)");
                return ResponseEntity.status(413).body("Image is too large. Maximum size is 10MB.");
            }
            
            String base64Image;
            try {
                base64Image = Base64.getEncoder().encodeToString(bytes);
                System.out.println("Base64 encoded: " + base64Image.length() + " characters");
            } catch (Exception e) {
                System.out.println("ERROR: Failed to encode base64: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to encode image: " + e.getMessage());
            }
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                contentType = "image/jpeg"; // Default fallback
            }
            System.out.println("Content type: " + contentType);
            
            String dataUri = "data:" + contentType + ";base64," + base64Image;
            System.out.println("Data URI created, length: " + dataUri.length() + " characters");
            
            // Проверка дали dataUri не е твърде голям (H2 TEXT поддържа до 2GB, но нека проверим)
            if (dataUri.length() > 50 * 1024 * 1024) { // 50MB като string
                System.out.println("ERROR: Data URI is too large (" + dataUri.length() + " characters)");
                return ResponseEntity.status(413).body("Image data is too large after encoding.");
            }
            
            try {
                System.out.println("Setting image URL on item (length: " + dataUri.length() + " chars)...");
                item.setImageUrl(dataUri);
                System.out.println("Image URL set on item");
                
                System.out.println("Saving item to repository with saveAndFlush...");
                Item savedItem = itemRepository.saveAndFlush(item);
                System.out.println("Item saved successfully with ID: " + savedItem.getId());
                System.out.println("Saved item imageUrl length: " + (savedItem.getImageUrl() != null ? savedItem.getImageUrl().length() : "null"));
            } catch (Exception e) {
                System.out.println("ERROR: Failed to save item to database");
                System.out.println("Exception type: " + e.getClass().getName());
                System.out.println("Exception message: " + e.getMessage());
                e.printStackTrace();
                if (e.getCause() != null) {
                    System.out.println("Cause type: " + e.getCause().getClass().getName());
                    System.out.println("Cause message: " + e.getCause().getMessage());
                    e.getCause().printStackTrace();
                }
                String errorMsg = "Failed to save to database: " + e.getMessage();
                if (e.getCause() != null) {
                    errorMsg += " (Cause: " + e.getCause().getMessage() + ")";
                }
                // Връщаме JSON форматирана грешка
                return ResponseEntity.status(500).body("{\"error\":\"" + errorMsg.replace("\"", "\\\"") + "\",\"path\":\"/upload/" + itemId + "\"}");
            }

            return ResponseEntity.ok("UPLOAD_OK");
        } catch (RuntimeException e) {
            System.out.println("RUNTIME ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = "Upload failed: " + e.getMessage();
            return ResponseEntity.status(500).body("{\"error\":\"" + errorMsg.replace("\"", "\\\"") + "\",\"path\":\"/upload/" + itemId + "\"}");
        } catch (Exception e) {
            System.out.println("ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            if (e.getCause() != null) {
                errorMsg += " (Cause: " + e.getCause().getMessage() + ")";
            }
            errorMsg = "Upload failed: " + errorMsg + " [" + e.getClass().getSimpleName() + "]";
            return ResponseEntity.status(500).body("{\"error\":\"" + errorMsg.replace("\"", "\\\"") + "\",\"path\":\"/upload/" + itemId + "\"}");
        }
    }

    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        try {
            String UPLOAD_DIR = getUploadDir();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Resource resource = new FileSystemResource(filePath.toFile());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String contentType = "application/octet-stream";
            try {
                contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (IOException e) {
                System.out.println("Could not determine content type: " + e.getMessage());
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            System.out.println("Error serving image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
