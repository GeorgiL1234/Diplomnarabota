package com.example.webshop.services;

import com.example.webshop.models.Favorite;
import com.example.webshop.models.Item;
import com.example.webshop.repositories.FavoriteRepository;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ItemRepository itemRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, ItemRepository itemRepository) {
        this.favoriteRepository = favoriteRepository;
        this.itemRepository = itemRepository;
    }

    public List<Favorite> getUserFavorites(String userEmail) {
        return favoriteRepository.findByUserEmailOrderByIdDesc(userEmail);
    }

    @Transactional
    public Favorite addFavorite(String userEmail, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Проверка дали вече е добавен в любими
        favoriteRepository.findByUserEmailAndItemId(userEmail, itemId)
                .ifPresent(f -> {
                    throw new RuntimeException("Item already in favorites");
                });

        Favorite favorite = new Favorite(userEmail, item);
        return favoriteRepository.saveAndFlush(favorite);
    }

    @Transactional
    public void removeFavorite(String userEmail, Long itemId) {
        favoriteRepository.deleteByUserEmailAndItemId(userEmail, itemId);
    }

    public boolean isFavorite(String userEmail, Long itemId) {
        return favoriteRepository.findByUserEmailAndItemId(userEmail, itemId).isPresent();
    }
}
