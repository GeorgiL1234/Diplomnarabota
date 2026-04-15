package com.example.webshop.controllers;

import com.example.webshop.exception.ApiException;
import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.services.VipPaymentService;
import com.example.webshop.validation.EmailValidation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/vip")
@CrossOrigin(origins = "*")
public class VipController {

    private final ItemRepository itemRepository;
    private final VipPaymentService vipPaymentService;

    public VipController(ItemRepository itemRepository, VipPaymentService vipPaymentService) {
        this.itemRepository = itemRepository;
        this.vipPaymentService = vipPaymentService;
    }

    /** Лека заявка за "подгряване" на Render.com – health check за VIP */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    // ACTIVATE VIP FOR ITEM (deprecated - use /vip-payment/complete instead)
    @PostMapping(value = "/activate", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Item activateVip(@RequestBody Map<String, Object> request) {
        Long itemId = requireLong(request, "itemId");
        String ownerEmail = EmailValidation.trim((String) request.get("ownerEmail"));
        if (ownerEmail.isEmpty() || !EmailValidation.isValid(ownerEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found"));

        if (item.getOwnerEmail() == null || !EmailValidation.trim(item.getOwnerEmail()).equals(ownerEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only activate VIP for your own listings");
        }

        if (!vipPaymentService.hasCompletedPayment(itemId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Payment is required to activate VIP. Please complete payment first.");
        }

        item.setIsVip(true);
        return itemRepository.saveAndFlush(item);
    }

    @PostMapping(value = "/deactivate", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Item deactivateVip(@RequestBody Map<String, Object> request) {
        Long itemId = requireLong(request, "itemId");
        String ownerEmail = EmailValidation.trim((String) request.get("ownerEmail"));
        if (ownerEmail.isEmpty() || !EmailValidation.isValid(ownerEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found"));

        if (item.getOwnerEmail() == null || !EmailValidation.trim(item.getOwnerEmail()).equals(ownerEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only deactivate VIP for your own listings");
        }

        item.setIsVip(false);
        return itemRepository.saveAndFlush(item);
    }

    private static Long requireLong(Map<String, Object> request, String key) {
        try {
            Object v = request.get(key);
            if (v == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, key + " is required");
            }
            return Long.valueOf(v.toString());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid " + key);
        }
    }
}
