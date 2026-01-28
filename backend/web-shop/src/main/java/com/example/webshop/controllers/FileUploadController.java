package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> uploadImage(
            @PathVariable Long itemId,
            @RequestPart("file") MultipartFile file,
            @RequestParam("ownerEmail") String ownerEmail) {

        try {
            System.out.println(">>> UPLOAD HIT <<<");
            System.out.println("Item ID: " + itemId);
            System.out.println("File name: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("File size: " + (file != null ? file.getSize() : "null"));
            System.out.println("Owner email: " + ownerEmail);

            if (file == null || file.isEmpty()) {
                System.out.println("Uploaded file is empty or null!");
                return ResponseEntity.badRequest().body("Empty file upload");
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
            byte[] bytes = file.getBytes();
            System.out.println("File bytes read: " + bytes.length + " bytes");
            
            // Проверка за размера
            if (bytes.length > 5 * 1024 * 1024) { // Ако е над 5MB
                System.out.println("WARNING: Image is very large (" + bytes.length + " bytes)");
            }
            
            String base64Image = Base64.getEncoder().encodeToString(bytes);
            System.out.println("Base64 encoded: " + base64Image.length() + " characters");
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                contentType = "image/jpeg"; // Default fallback
            }
            System.out.println("Content type: " + contentType);
            
            String dataUri = "data:" + contentType + ";base64," + base64Image;
            System.out.println("Data URI created, length: " + dataUri.length() + " characters");
            
            item.setImageUrl(dataUri);
            System.out.println("Image URL set on item");
            
            itemRepository.save(item);
            System.out.println("Item saved to database successfully");

            return ResponseEntity.ok("UPLOAD_OK");
        } catch (RuntimeException e) {
            System.out.println("RUNTIME ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown error";
            if (e.getCause() != null) {
                errorMsg += " (Cause: " + e.getCause().getMessage() + ")";
            }
            return ResponseEntity.status(500).body("Upload failed: " + errorMsg + " [" + e.getClass().getSimpleName() + "]");
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
