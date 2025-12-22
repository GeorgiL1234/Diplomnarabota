package com.example.webshop.services;

import com.example.webshop.models.CartItem;
import com.example.webshop.models.Item;
import com.example.webshop.models.User;
import com.example.webshop.repositories.CartItemRepository;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartRepo;
    private final ItemRepository itemRepo;

    public CartService(CartItemRepository cartRepo, ItemRepository itemRepo) {
        this.cartRepo = cartRepo;
        this.itemRepo = itemRepo;
    }

    public List<CartItem> getUserCart(User user) {
        return cartRepo.findByUser(user);
    }

    public CartItem addToCart(User user, Long itemId, int quantity) {
        Item item = itemRepo.findById(itemId).orElse(null);
        if (item == null)
            return null;

        CartItem cartItem = new CartItem(user, item, quantity);
        return cartRepo.save(cartItem);
    }

    public void clearCart(User user) {
        cartRepo.deleteByUser(user);
    }
}
