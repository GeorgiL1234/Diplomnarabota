package com.example.webshop.controllers;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.services.ItemService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/vip")
@CrossOrigin(origins = "*")
public class VipController {

    private final ItemRepository itemRepository;
    private final ItemService itemService;

    public VipController(ItemRepository itemRepository, ItemService itemService) {
        this.itemRepository = itemRepository;
        this.itemService = itemService;
    }

    // ACTIVATE VIP FOR ITEM
    @PostMapping(value = "/activate", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Item activateVip(@RequestBody Map<String, Object> request) {
        Long itemId = Long.valueOf(request.get("itemId").toString());
        String ownerEmail = (String) request.get("ownerEmail");

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Проверка дали потребителят е собственик на обявата
        if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You can only activate VIP for your own listings");
        }

        // Активиране на VIP (плащането от 2 лева се приема като направено)
        item.setIsVip(true);
        return itemRepository.saveAndFlush(item);
    }

    // DEACTIVATE VIP FOR ITEM
    @PostMapping(value = "/deactivate", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Item deactivateVip(@RequestBody Map<String, Object> request) {
        Long itemId = Long.valueOf(request.get("itemId").toString());
        String ownerEmail = (String) request.get("ownerEmail");

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Проверка дали потребителят е собственик на обявата
        if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You can only deactivate VIP for your own listings");
        }

        item.setIsVip(false);
        return itemRepository.saveAndFlush(item);
    }
}
