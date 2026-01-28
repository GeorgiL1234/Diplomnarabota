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
            String UPLOAD_DIR = getUploadDir();
            System.out.println(">>> UPLOAD HIT <<<");
            System.out.println("Upload dir: " + UPLOAD_DIR);
            System.out.println("File name: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("File size: " + (file != null ? file.getSize() : "null"));
            System.out.println("Owner email: " + ownerEmail);

            if (file == null || file.isEmpty()) {
                System.out.println("Uploaded file is empty or null!");
                return ResponseEntity.badRequest().body("Empty file upload");
            }

            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            // Проверка дали потребителят е собственик на обявата
            if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
                System.out.println("Owner mismatch! Item owner: " + item.getOwnerEmail() + ", Request owner: " + ownerEmail);
                return ResponseEntity.status(403).body("You can only upload images to your own listings");
            }

            File uploadDir = new File(UPLOAD_DIR);
            System.out.println("Creating upload directory: " + uploadDir.getAbsolutePath());
            System.out.println("Directory exists: " + uploadDir.exists());
            System.out.println("Directory can write: " + uploadDir.canWrite());
            
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                System.out.println("Directory created: " + created);
                if (!created && !uploadDir.exists()) {
                    System.out.println("ERROR: Could not create upload directory!");
                    // Опитай се с абсолютен път
                    String altPath = "/tmp/uploads/";
                    File altDir = new File(altPath);
                    if (altDir.mkdirs() || altDir.exists()) {
                        uploadDir = altDir;
                        UPLOAD_DIR = altPath;
                        System.out.println("Using alternative path: " + altPath);
                    } else {
                        return ResponseEntity.status(500).body("Could not create upload directory: " + uploadDir.getAbsolutePath());
                    }
                }
            }

            // Проверка за права за запис
            if (!uploadDir.canWrite()) {
                System.out.println("ERROR: No write permissions to upload directory!");
                return ResponseEntity.status(500).body("No write permissions to upload directory: " + uploadDir.getAbsolutePath());
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            // Санитизирай името на файла
            fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            File destination = new File(uploadDir, fileName);
            System.out.println("Saving file to: " + destination.getAbsolutePath());

            // Опитай се да запишеш файла на диск
            boolean fileSaved = false;
            try {
                byte[] bytes = file.getBytes();
                Files.write(destination.toPath(), bytes);
                
                if (destination.exists() && destination.length() > 0 && destination.canRead()) {
                    fileSaved = true;
                    System.out.println("File saved to disk successfully! Size: " + destination.length() + " bytes");
                    item.setImageUrl("/uploads/" + fileName);
                }
            } catch (Exception e) {
                System.out.println("Failed to save file to disk: " + e.getMessage());
                // Продължи към base64 fallback
            }
            
            // Ако файлът не може да се запише на диск, запази като base64 в базата данни
            if (!fileSaved) {
                try {
                    System.out.println("Saving image as base64 in database...");
                    byte[] bytes = file.getBytes();
                    String base64Image = Base64.getEncoder().encodeToString(bytes);
                    String contentType = file.getContentType();
                    if (contentType == null) {
                        contentType = "image/jpeg";
                    }
                    String dataUri = "data:" + contentType + ";base64," + base64Image;
                    item.setImageUrl(dataUri);
                    System.out.println("Image saved as base64. Size: " + base64Image.length() + " characters");
                } catch (Exception e) {
                    System.out.println("ERROR: Failed to save image as base64: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.status(500).body("Failed to save image: " + e.getMessage());
                }
            }
            
            itemRepository.save(item);
            System.out.println("Item updated with image URL/image data");

            return ResponseEntity.ok("UPLOAD_OK");
        } catch (Exception e) {
            System.out.println("ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (e.getCause() != null) {
                errorMsg += " (Cause: " + e.getCause().getMessage() + ")";
            }
            return ResponseEntity.status(500).body("Upload failed: " + errorMsg);
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
