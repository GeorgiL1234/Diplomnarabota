package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.http.MediaType;
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
    public String uploadImage(
            @PathVariable Long itemId,
            @RequestPart("file") MultipartFile file,
            @RequestParam("ownerEmail") String ownerEmail) throws IOException {

        System.out.println(">>> UPLOAD HIT <<<");
        System.out.println("Upload dir: " + UPLOAD_DIR);
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Owner email: " + ownerEmail);

        if (file.isEmpty()) {
            System.out.println("Uploaded file is empty!");
            throw new RuntimeException("Empty file upload");
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Проверка дали потребителят е собственик на обявата
        if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You can only upload images to your own listings");
        }

        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File destination = new File(uploadDir, fileName);

        file.transferTo(destination);

        item.setImageUrl("/uploads/" + fileName);
        itemRepository.save(item);

        return "UPLOAD_OK";
    }
}
