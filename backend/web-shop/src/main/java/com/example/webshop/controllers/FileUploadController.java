package com.example.webshop.controllers;

import com.example.webshop.config.UploadStorage;
import com.example.webshop.exception.ApiException;
import com.example.webshop.models.Item;
import com.example.webshop.validation.EmailValidation;
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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final ItemRepository itemRepository;

    public FileUploadController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @PostMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional(timeout = 60)
    public ResponseEntity<?> uploadImage(
            @PathVariable Long itemId,
            @RequestParam(value = "file") MultipartFile file,
            @RequestParam(value = "ownerEmail") String ownerEmail,
            @RequestParam(value = "append", required = false, defaultValue = "false") boolean append) {

            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"File is required\",\"status\":\"error\"}");
            }

            String owner = EmailValidation.trim(ownerEmail);
            if (owner.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Owner email is required\",\"status\":\"error\"}");
            }
            if (!EmailValidation.isValid(owner)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Invalid owner email address\",\"status\":\"error\"}");
            }

            if (itemId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Item ID is required\",\"status\":\"error\"}");
            }

            Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found: " + itemId));

            if (item.getOwnerEmail() == null || !EmailValidation.trim(item.getOwnerEmail()).equals(owner)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"You can only upload images to your own listings\",\"status\":\"error\"}");
            }

            byte[] bytes;
            try {
                bytes = file.getBytes();
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Failed to read file: " + escapeJson(e.getMessage()) + "\",\"status\":\"error\"}");
            }

            if (bytes.length > 3 * 1024 * 1024) {
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Image is too large. Maximum size is 3MB. Please compress or resize your image.\",\"status\":\"error\"}");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"File must be an image\",\"status\":\"error\"}");
            }

            String ext = extensionForImage(contentType, file.getOriginalFilename());
            String filename = itemId + "_" + UUID.randomUUID() + ext;
            Path root = UploadStorage.getUploadRoot();
            Path dest = root.resolve(filename).normalize();
            if (!dest.startsWith(root)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Invalid storage path\",\"status\":\"error\"}");
            }

            try {
                Files.write(dest, bytes);
            } catch (IOException e) {
                try {
                    Files.deleteIfExists(dest);
                } catch (IOException ignored) {
                }
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"Failed to save file: " + escapeJson(e.getMessage()) + "\",\"status\":\"error\"}");
            }

            String token = UploadStorage.FS_PREFIX + filename;
            String newImageUrl;
            if (append && item.getImageUrl() != null && !item.getImageUrl().trim().isEmpty()) {
                newImageUrl = item.getImageUrl().trim() + UploadStorage.IMAGE_PART_DELIMITER + token;
            } else {
                if (item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
                    for (String part : item.getImageUrl().split(Pattern.quote(UploadStorage.IMAGE_PART_DELIMITER))) {
                        String p = part.trim();
                        if (p.startsWith(UploadStorage.FS_PREFIX)) {
                            UploadStorage.deleteStoredFileIfExists(p.substring(UploadStorage.FS_PREFIX.length()));
                        }
                    }
                }
                newImageUrl = token;
            }

            item.setImageUrl(newImageUrl);
            itemRepository.saveAndFlush(item);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"status\":\"success\",\"message\":\"Image uploaded successfully\",\"imageAvailable\":true,\"itemId\":" + itemId + "}");
    }

    private static String extensionForImage(String contentType, String originalFilename) {
        if (contentType != null) {
            if (contentType.contains("png")) return ".png";
            if (contentType.contains("gif")) return ".gif";
            if (contentType.contains("webp")) return ".webp";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) return ".jpg";
        }
        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (lower.endsWith(".png")) return ".png";
            if (lower.endsWith(".gif")) return ".gif";
            if (lower.endsWith(".webp")) return ".webp";
            if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return ".jpg";
        }
        return ".jpg";
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }

    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        try {
            if (!UploadStorage.isSafeStoredFileName(fileName)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            Path root = UploadStorage.getUploadRoot();
            Path filePath = root.resolve(fileName).normalize();
            if (!filePath.startsWith(root)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            Resource resource = new FileSystemResource(filePath.toFile());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String contentType = "application/octet-stream";
            try {
                String probed = Files.probeContentType(filePath);
                if (probed != null) {
                    contentType = probed;
                }
            } catch (IOException ignored) {
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
