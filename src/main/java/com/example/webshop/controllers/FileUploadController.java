package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/";

    private final ItemRepository itemRepository;

    public FileUploadController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @PostMapping("/{itemId}")
    public String uploadImage(
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file) throws IOException {

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File destination = new File(UPLOAD_DIR + fileName);

        file.transferTo(destination);

        item.setImageUrl("/uploads/" + fileName);
        itemRepository.save(item);

        return "UPLOAD_OK";
    }
}
