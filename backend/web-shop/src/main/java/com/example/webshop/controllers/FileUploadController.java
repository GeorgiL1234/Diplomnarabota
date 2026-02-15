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

    @PostMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(timeout = 60) // Увеличаваме timeout до 60 секунди за големи файлове
    public ResponseEntity<?> uploadImage(
            @PathVariable Long itemId,
            @RequestParam(value = "file") MultipartFile file,
            @RequestParam(value = "ownerEmail") String ownerEmail) {

        System.out.println("========================================");
        System.out.println(">>> UPLOAD ENDPOINT CALLED <<<");
        System.out.println("Timestamp: " + System.currentTimeMillis());
        System.out.println("Item ID: " + itemId);
        System.out.println("Owner email: " + ownerEmail);
        System.out.println("File object: " + (file != null ? "NOT NULL" : "NULL"));
        
        try {
            // Валидация на входните данни
            if (file == null || file.isEmpty()) {
                System.out.println("ERROR: File is null or empty!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"File is required\",\"status\":\"error\"}");
            }
            
            if (ownerEmail == null || ownerEmail.trim().isEmpty()) {
                System.out.println("ERROR: Owner email is null or empty!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Owner email is required\",\"status\":\"error\"}");
            }
            
            if (itemId == null) {
                System.out.println("ERROR: Item ID is null!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Item ID is required\",\"status\":\"error\"}");
            }
            
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize() + " bytes");
            System.out.println("File content type: " + file.getContentType());
            System.out.println("File isEmpty: " + file.isEmpty());

            // Това вече е проверено по-горе, но оставяме за сигурност

            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

            // Проверка дали потребителят е собственик на обявата
            if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
                System.out.println("Owner mismatch! Item owner: " + item.getOwnerEmail() + ", Request owner: " + ownerEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"You can only upload images to your own listings\",\"status\":\"error\"}");
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
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Failed to read file: " + e.getMessage().replace("\"", "\\\"").replace("\n", " ") + "\",\"status\":\"error\"}");
            }
            
            // Проверка за размера - ограничаваме до 3MB за по-добра производителност
            // Base64 encoding увеличава размера с ~33%, така че 3MB файл става ~4MB като base64
            if (bytes.length > 3 * 1024 * 1024) { // Ако е над 3MB
                System.out.println("ERROR: Image is too large (" + bytes.length + " bytes, max 3MB)");
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Image is too large. Maximum size is 3MB. Please compress or resize your image.\",\"status\":\"error\"}");
            }
            
            String base64Image;
            try {
                base64Image = Base64.getEncoder().encodeToString(bytes);
                System.out.println("Base64 encoded: " + base64Image.length() + " characters");
            } catch (Exception e) {
                System.out.println("ERROR: Failed to encode base64: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Failed to encode image: " + e.getMessage().replace("\"", "\\\"").replace("\n", " ") + "\",\"status\":\"error\"}");
            }
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                contentType = "image/jpeg"; // Default fallback
            }
            System.out.println("Content type: " + contentType);
            
            String dataUri = "data:" + contentType + ";base64," + base64Image;
            System.out.println("Data URI created, length: " + dataUri.length() + " characters");
            
            // Проверка дали dataUri не е null или празен
            if (dataUri == null || dataUri.isEmpty()) {
                System.out.println("ERROR: Data URI is null or empty after encoding!");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Failed to create image data URI\",\"status\":\"error\"}");
            }
            
            // Проверка дали dataUri не е твърде голям преди да опитаме да го запазим
            // Base64 encoding увеличава размера с ~33%, така че 3MB файл става ~4MB като base64 string
            // Ограничаваме до 5MB като string за сигурност
            if (dataUri.length() > 5 * 1024 * 1024) { // 5MB като string
                System.out.println("ERROR: Data URI is too large (" + dataUri.length() + " characters, max 5MB)");
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Image data is too large after encoding. Maximum size is 3MB. Please compress or resize your image.\",\"status\":\"error\"}");
            }
            
            try {
                System.out.println("Setting image URL on item (length: " + dataUri.length() + " chars)...");
                
                item.setImageUrl(dataUri);
                System.out.println("Image URL set on item");
                
                System.out.println("Saving item to repository with save()...");
                // Използваме save() вместо saveAndFlush() за по-добра производителност
                // Spring ще направи flush автоматично при commit на транзакцията
                Item savedItem;
                try {
                    // Опитваме се да запазим item-а
                    savedItem = itemRepository.save(item);
                    System.out.println("Item saved successfully with ID: " + savedItem.getId());
                    
                    // Проверяваме дали imageUrl е запазен правилно
                    String savedImageUrl = savedItem.getImageUrl();
                    System.out.println("Saved item imageUrl length: " + (savedImageUrl != null ? savedImageUrl.length() : "null"));
                    
                    if (savedImageUrl == null || savedImageUrl.isEmpty()) {
                        System.out.println("WARNING: Image URL is null or empty after save - trying to reload item");
                        // Опитваме се да презаредим item-а от базата данни
                        Item reloadedItem = itemRepository.findById(itemId).orElse(null);
                        if (reloadedItem != null && reloadedItem.getImageUrl() != null && !reloadedItem.getImageUrl().isEmpty()) {
                            System.out.println("SUCCESS: Image URL found after reload, length: " + reloadedItem.getImageUrl().length());
                            savedItem = reloadedItem;
                        } else {
                            System.out.println("WARNING: Image URL still null after reload");
                            // Не хвърляме грешка тук, защото обявата е създадена успешно
                            // Просто логваме предупреждението
                        }
                    } else {
                        System.out.println("SUCCESS: Image URL saved successfully, length: " + savedImageUrl.length());
                    }
                } catch (Exception saveException) {
                    System.out.println("ERROR during save(): " + saveException.getClass().getName());
                    System.out.println("ERROR message: " + saveException.getMessage());
                    saveException.printStackTrace();
                    if (saveException.getCause() != null) {
                        System.out.println("ERROR cause: " + saveException.getCause().getClass().getName());
                        System.out.println("ERROR cause message: " + saveException.getCause().getMessage());
                        saveException.getCause().printStackTrace();
                    }
                    
                    // Проверка за специфични типове грешки
                    String errorMsg = "Failed to save item: " + saveException.getMessage();
                    if (saveException instanceof org.hibernate.exception.DataException) {
                        errorMsg = "Image data is too large for database. Please use a smaller image (max 3MB).";
                    } else if (saveException instanceof org.springframework.dao.DataIntegrityViolationException) {
                        errorMsg = "Database constraint violation. Please try again.";
                    } else if (saveException.getMessage() != null && (
                        saveException.getMessage().contains("too large") ||
                        saveException.getMessage().contains("exceeds") ||
                        saveException.getMessage().contains("length")
                    )) {
                        errorMsg = "Image data is too large. Maximum size is 3MB. Please compress or resize your image.";
                    }
                    
                    throw new RuntimeException(errorMsg, saveException);
                }
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
                
                // По-добра обработка на различни типове грешки
                String errorMsg = "Failed to save to database";
                if (e.getMessage() != null) {
                    errorMsg += ": " + e.getMessage();
                }
                if (e.getCause() != null && e.getCause().getMessage() != null) {
                    errorMsg += " (Cause: " + e.getCause().getMessage() + ")";
                }
                
                // Проверка за специфични типове грешки
                if (e instanceof org.hibernate.exception.DataException) {
                    errorMsg = "Image data is too large for database. Please use a smaller image.";
                } else if (e instanceof org.springframework.dao.DataIntegrityViolationException) {
                    errorMsg = "Database constraint violation. Please try again.";
                } else if (e.getMessage() != null && e.getMessage().contains("too large")) {
                    errorMsg = "Image is too large. Maximum size is 10MB.";
                }
                
                // Връщаме JSON форматирана грешка
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"" + errorMsg.replace("\"", "\\\"").replace("\n", " ").replace("\r", " ") + "\",\"status\":\"error\",\"path\":\"/upload/" + itemId + "\"}");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"status\":\"success\",\"message\":\"Image uploaded successfully\"}");
        } catch (RuntimeException e) {
            System.out.println("RUNTIME ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage().replace("\"", "\\\"").replace("\n", " ") : "Upload failed";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"" + errorMsg + "\",\"status\":\"error\",\"path\":\"/upload/" + itemId + "\"}");
        } catch (Exception e) {
            System.out.println("ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            if (e.getCause() != null) {
                errorMsg += " (Cause: " + e.getCause().getMessage() + ")";
            }
            errorMsg = "Upload failed: " + errorMsg + " [" + e.getClass().getSimpleName() + "]";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"" + errorMsg.replace("\"", "\\\"").replace("\n", " ") + "\",\"status\":\"error\",\"path\":\"/upload/" + itemId + "\"}");
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
