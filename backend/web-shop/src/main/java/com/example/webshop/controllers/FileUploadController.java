package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    /**
     * Base directory for file uploads.
     * Uses the current working directory of the application to build
     * an absolute path, which е по-стабилно под Windows.
     */
    private static final String UPLOAD_DIR = System.getProperty("user.dir")
            + File.separator + "uploads" + File.separator;

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
            System.out.println("Upload dir: " + UPLOAD_DIR);
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
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
            if (!uploadDir.exists()) {
                boolean created = uploadDir.mkdirs();
                System.out.println("Directory created: " + created);
                if (!created && !uploadDir.exists()) {
                    System.out.println("ERROR: Could not create upload directory!");
                    return ResponseEntity.status(500).body("Could not create upload directory: " + uploadDir.getAbsolutePath());
                }
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destination = new File(uploadDir, fileName);
            System.out.println("Saving file to: " + destination.getAbsolutePath());

            try {
                file.transferTo(destination);
                System.out.println("File saved successfully!");
            } catch (IOException e) {
                System.out.println("ERROR saving file: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to save file: " + e.getMessage());
            }

            item.setImageUrl("/uploads/" + fileName);
            itemRepository.save(item);
            System.out.println("Item updated with image URL: " + item.getImageUrl());

            return ResponseEntity.ok("UPLOAD_OK");
        } catch (Exception e) {
            System.out.println("ERROR in upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
