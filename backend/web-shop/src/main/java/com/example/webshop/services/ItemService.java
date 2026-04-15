package com.example.webshop.services;

import com.example.webshop.config.UploadStorage;
import com.example.webshop.dto.ItemListDto;
import com.example.webshop.exception.ApiException;
import com.example.webshop.models.Item;
import org.springframework.http.HttpStatus;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.validation.EmailValidation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Item create(Item item) {
        validateListingEmails(item);
        // Валидация: поне email или телефон трябва да е попълнен
        if ((item.getContactEmail() == null || item.getContactEmail().trim().isEmpty()) &&
            (item.getContactPhone() == null || item.getContactPhone().trim().isEmpty())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Трябва да посочите поне email или телефон за контакт");
        }
        // saveAndFlush() принудително записва в базата данни веднага
        return itemRepository.saveAndFlush(item);
    }

    public List<Item> getAll() {
        return getAllSorted();
    }

    /** Списък БЕЗ imageUrl – за list view (избягваме 500 от големи base64 в response) */
    public List<ItemListDto> getAllForList() {
        return getAllSorted().stream()
                .map(ItemListDto::from)
                .toList();
    }

    private List<Item> getAllSorted() {
        List<Item> allItems = itemRepository.findAll();
        allItems.sort((a, b) -> {
            boolean aVip = a.getIsVip() != null && a.getIsVip();
            boolean bVip = b.getIsVip() != null && b.getIsVip();
            if (aVip && !bVip) return -1;
            if (!aVip && bVip) return 1;
            return 0;
        });
        return allItems;
    }

    public Item getById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found"));
    }

    @Transactional
    public Item update(Long id, Item updatedItem) {
        Item item = getById(id);

        item.setTitle(updatedItem.getTitle());
        item.setDescription(updatedItem.getDescription());
        item.setPrice(updatedItem.getPrice());
        item.setCategory(updatedItem.getCategory());
        String contactMail = EmailValidation.trim(updatedItem.getContactEmail());
        if (!contactMail.isEmpty() && !EmailValidation.isValid(contactMail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid contact email address");
        }
        item.setContactEmail(contactMail.isEmpty() ? null : contactMail);
        item.setContactPhone(updatedItem.getContactPhone());
        // ownerEmail не го сменяме при update (за да не "крадат" обяви)

        return itemRepository.save(item);
    }

    @Transactional
    public void delete(Long id) {
        itemRepository.findById(id).ifPresent(item -> {
            String raw = item.getImageUrl();
            if (raw != null && !raw.isEmpty()) {
                for (String part : raw.split(Pattern.quote(UploadStorage.IMAGE_PART_DELIMITER))) {
                    String p = part.trim();
                    if (p.startsWith(UploadStorage.FS_PREFIX)) {
                        UploadStorage.deleteStoredFileIfExists(p.substring(UploadStorage.FS_PREFIX.length()));
                    }
                }
            }
        });
        itemRepository.deleteById(id);
    }

    private void validateListingEmails(Item item) {
        String owner = EmailValidation.trim(item.getOwnerEmail());
        if (owner.isEmpty() || !EmailValidation.isValid(owner)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid owner email address");
        }
        item.setOwnerEmail(owner);

        String contact = EmailValidation.trim(item.getContactEmail());
        if (!contact.isEmpty() && !EmailValidation.isValid(contact)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid contact email address");
        }
        item.setContactEmail(contact.isEmpty() ? null : contact);
    }
}
