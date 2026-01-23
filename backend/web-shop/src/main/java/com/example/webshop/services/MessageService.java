package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.models.Message;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.repositories.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ItemRepository itemRepository;

    public MessageService(MessageRepository messageRepository, ItemRepository itemRepository) {
        this.messageRepository = messageRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Message addMessage(Long itemId, Message message) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        message.setItem(item);
        return messageRepository.save(message);
    }

    public List<Message> getMessagesForItem(Long itemId) {
        return messageRepository.findByItemIdOrderByCreatedAtDesc(itemId);
    }

    @Transactional
    public Message addResponse(Long messageId, String response) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.setResponse(response);
        return messageRepository.save(message);
    }

    // Въпроси, които потребителят е задал (като купувач)
    public List<Message> getMessagesSentByUser(String userEmail) {
        return messageRepository.findBySenderEmailOrderByCreatedAtDesc(userEmail);
    }

    // Въпроси, зададени към обяви на потребителя (като продавач)
    public List<Message> getMessagesForUserItems(String ownerEmail) {
        return messageRepository.findMessagesForOwnerItems(ownerEmail);
    }
}
