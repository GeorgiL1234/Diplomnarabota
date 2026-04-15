package com.example.webshop.services;

import com.example.webshop.exception.ApiException;
import com.example.webshop.models.Item;
import com.example.webshop.models.Message;
import org.springframework.http.HttpStatus;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.repositories.MessageRepository;
import com.example.webshop.validation.EmailValidation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    private final MessageRepository messageRepository;
    private final ItemRepository itemRepository;
    private final WebSocketNotificationService wsNotification;

    public MessageService(MessageRepository messageRepository, ItemRepository itemRepository,
                          WebSocketNotificationService wsNotification) {
        this.messageRepository = messageRepository;
        this.itemRepository = itemRepository;
        this.wsNotification = wsNotification;
    }

    @Transactional
    public Message addMessage(Long itemId, Message message) {
        logger.info("Adding message for item ID: {}, sender: {}", itemId, message.getSenderEmail());
        
        // Валидация
        if (message == null) {
            logger.error("Message is null");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Message data is required");
        }
        
        String sender = EmailValidation.trim(message.getSenderEmail());
        if (sender.isEmpty()) {
            logger.error("Sender email is null or empty");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sender email is required");
        }
        if (!EmailValidation.isValid(sender)) {
            logger.error("Sender email invalid format");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid sender email address");
        }
        message.setSenderEmail(sender);
        
        if (message.getContent() == null || message.getContent().trim().isEmpty()) {
            logger.error("Message content is null or empty");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Message content is required");
        }
        
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    logger.error("Item not found with ID: {}", itemId);
                    return new ApiException(HttpStatus.NOT_FOUND, "Item not found");
                });

        // Задаваме item и timestamp
        message.setItem(item);
        
        // Уверяваме се че createdAt е зададен
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(LocalDateTime.now());
        }
        
        logger.debug("Saving message: sender={}, content length={}, itemId={}", 
            message.getSenderEmail(), message.getContent().length(), itemId);
        
        Message saved = messageRepository.save(message);
        logger.info("Message saved successfully with ID: {}", saved.getId());
        wsNotification.notifyNewMessage(saved);
        return saved;
    }

    public List<Message> getMessagesForItem(Long itemId) {
        return messageRepository.findByItemIdOrderByCreatedAtDesc(itemId);
    }

    @Transactional
    public Message addResponse(Long messageId, String response) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));

        message.setResponse(response);
        Message saved = messageRepository.save(message);
        wsNotification.notifyNewResponse(saved);
        return saved;
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
