package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/files")
public class FileUploadController {

    @Autowired
    private ItemRepository itemRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload/{itemId}")
    public String uploadImage(@PathVariable Long itemId,
            @RequestParam("image") MultipartFile file) throws IOException {

        Item item = itemRepository.findById(itemId).orElse(null);

        if (item == null) {
            return "Item not found!";
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        File uploadPath = new File(UPLOAD_DIR);
        if (!uploadPath.exists())
            uploadPath.mkdirs();

        File dest = new File(UPLOAD_DIR + fileName);
        file.transferTo(dest);

        item.setImageUrl("/uploads/" + fileName);
        itemRepository.save(item);

        return "Image uploaded!";
    }
}
