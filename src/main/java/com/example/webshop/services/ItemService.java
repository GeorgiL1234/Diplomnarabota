package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public Item create(Item item) {
        return itemRepository.save(item);
    }

    public List<Item> getAll() {
        return itemRepository.findAll();
    }

    public Item getById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public Item update(Long id, Item updatedItem) {
        Item item = getById(id);

        item.setTitle(updatedItem.getTitle());
        item.setDescription(updatedItem.getDescription());
        item.setPrice(updatedItem.getPrice());

        return itemRepository.save(item);
    }

    public void delete(Long id) {
        itemRepository.deleteById(id);
    }
}
