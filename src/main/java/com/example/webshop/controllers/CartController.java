package com.example.webshop.controllers;

import com.example.webshop.models.CartItem;
import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import com.example.webshop.services.CartService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepo;

    public CartController(CartService cartService, UserRepository userRepo) {
        this.cartService = cartService;
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<CartItem> getCart(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElse(null);
        return cartService.getUserCart(user);
    }

    @PostMapping("/add")
    public CartItem add(Authentication auth,
            @RequestParam Long itemId,
            @RequestParam int quantity) {

        User user = userRepo.findByEmail(auth.getName()).orElse(null);
        return cartService.addToCart(user, itemId, quantity);
    }
}
