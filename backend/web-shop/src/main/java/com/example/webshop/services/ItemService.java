package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.repositories.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Item create(Item item) {
        // Валидация: поне email или телефон трябва да е попълнен
        if ((item.getContactEmail() == null || item.getContactEmail().trim().isEmpty()) &&
            (item.getContactPhone() == null || item.getContactPhone().trim().isEmpty())) {
            throw new RuntimeException("Трябва да посочите поне email или телефон за контакт");
        }
        // saveAndFlush() принудително записва в базата данни веднага
        return itemRepository.saveAndFlush(item);
    }

    public List<Item> getAll() {
        // Сортираме обявите: VIP първо, след това останалите
        List<Item> allItems = itemRepository.findAll();
        allItems.sort((a, b) -> {
            boolean aVip = a.getIsVip() != null && a.getIsVip();
            boolean bVip = b.getIsVip() != null && b.getIsVip();
            if (aVip && !bVip) return -1; // a е VIP, b не е - a първо
            if (!aVip && bVip) return 1;  // b е VIP, a не е - b първо
            return 0; // И двете са VIP или и двете не са - запазваме оригиналния ред
        });
        return allItems;
    }

    public Item getById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    @Transactional
    public Item update(Long id, Item updatedItem) {
        Item item = getById(id);

        item.setTitle(updatedItem.getTitle());
        item.setDescription(updatedItem.getDescription());
        item.setPrice(updatedItem.getPrice());
        item.setCategory(updatedItem.getCategory());
        item.setContactEmail(updatedItem.getContactEmail());
        item.setContactPhone(updatedItem.getContactPhone());
        // ownerEmail не го сменяме при update (за да не "крадат" обяви)

        return itemRepository.save(item);
    }

    @Transactional
    public void delete(Long id) {
        itemRepository.deleteById(id);
    }
}
