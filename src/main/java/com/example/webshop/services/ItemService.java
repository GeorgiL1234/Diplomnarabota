package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    // Методът, който твоят ItemController очаква:
    public Item create(Item item) {
        return itemRepository.save(item);
    }

    // Старият метод (може да остане, не пречи)
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    // Методът, който ItemController очаква:
    public List<Item> getAll() {
        return itemRepository.findAll();
    }

    // Старият метод (може да остане)
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    public Item updateItem(Long id, Item newItemData) {
        Item existing = itemRepository.findById(id).orElse(null);
        if (existing == null)
            return null;

        existing.setTitle(newItemData.getTitle());
        existing.setDescription(newItemData.getDescription());
        existing.setPrice(newItemData.getPrice());

        return itemRepository.save(existing);
    }

    public boolean deleteItem(Long id) {
        if (!itemRepository.existsById(id))
            return false;
        itemRepository.deleteById(id);
        return true;
    }
}
