package com.example.webshop.controllers;

import com.example.webshop.models.Favorite;
import com.example.webshop.services.FavoriteService;
import com.example.webshop.validation.EmailValidation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    // GET USER FAVORITES
    @GetMapping(value = "/{email}", produces = "application/json;charset=UTF-8")
    public List<Favorite> getUserFavorites(@PathVariable String email) {
        String e = requireValidEmailPath(email);
        return favoriteService.getUserFavorites(e);
    }

    // ADD TO FAVORITES
    @PostMapping(consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Favorite addFavorite(@RequestBody Map<String, Object> request) {
        String userEmail = (String) request.get("userEmail");
        Long itemId = Long.valueOf(request.get("itemId").toString());
        return favoriteService.addFavorite(userEmail, itemId);
    }

    // REMOVE FROM FAVORITES
    @DeleteMapping(value = "/{email}/{itemId}")
    public void removeFavorite(@PathVariable String email, @PathVariable Long itemId) {
        favoriteService.removeFavorite(requireValidEmailPath(email), itemId);
    }

    // CHECK IF FAVORITE
    @GetMapping(value = "/{email}/{itemId}/check", produces = "application/json;charset=UTF-8")
    public Map<String, Boolean> isFavorite(@PathVariable String email, @PathVariable Long itemId) {
        return Map.of("isFavorite", favoriteService.isFavorite(requireValidEmailPath(email), itemId));
    }

    private static String requireValidEmailPath(String email) {
        String e = EmailValidation.trim(email);
        if (!EmailValidation.isValid(e)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }
        return e;
    }
}
