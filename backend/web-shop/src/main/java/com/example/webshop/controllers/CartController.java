package com.example.webshop.controllers;

import com.example.webshop.exception.ApiException;
import com.example.webshop.models.CartItem;
import com.example.webshop.models.User;
import com.example.webshop.repositories.UserRepository;
import com.example.webshop.services.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepo;

    public CartController(CartService cartService, UserRepository userRepo) {
        this.cartService = cartService;
        this.userRepo = userRepo;
    }

    /** Лека заявка за "подгряване" на Render.com – health check за cart */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping
    public List<CartItem> getCart(Authentication auth) {
        User user = requireUser(auth);
        return cartService.getUserCart(user);
    }

    @PostMapping("/add")
    public CartItem add(Authentication auth,
            @RequestParam Long itemId,
            @RequestParam int quantity) {

        User user = requireUser(auth);
        return cartService.addToCart(user, itemId, quantity);
    }

    private User requireUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }
}
