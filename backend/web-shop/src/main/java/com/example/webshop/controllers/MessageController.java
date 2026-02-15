package com.example.webshop.controllers;

import com.example.webshop.models.Message;
import com.example.webshop.services.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // CREATE MESSAGE/QUESTION
    @PostMapping(value = "/{itemId}/messages", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public ResponseEntity<?> addMessage(
            @PathVariable Long itemId,
            @RequestBody Message message) {
        try {
            logger.info("Received message creation request for item ID: {}", itemId);
            
            if (message == null) {
                logger.error("Message is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Message data is required");
            }
            
            Message saved = messageService.addMessage(itemId, message);
            logger.info("Message created successfully with ID: {} for item ID: {}", saved.getId(), itemId);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            logger.error("Error creating message for item ID: {}", itemId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating message for item ID: {}", itemId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create message: " + e.getMessage());
        }
    }

    // GET MESSAGES FOR ITEM
    @GetMapping(value = "/{itemId}/messages", produces = "application/json;charset=UTF-8")
    public List<Message> getMessages(@PathVariable Long itemId) {
        return messageService.getMessagesForItem(itemId);
    }

    // ADD RESPONSE TO MESSAGE
    @PutMapping(value = "/messages/{messageId}/response", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public ResponseEntity<?> addResponse(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request) {
        try {
            logger.info("Received response request for message ID: {}", messageId);
            
            if (request == null || !request.containsKey("response")) {
                logger.error("Response data is missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Response data is required");
            }
            
            String response = request.get("response");
            if (response == null || response.trim().isEmpty()) {
                logger.error("Response content is empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Response content cannot be empty");
            }
            
            Message updated = messageService.addResponse(messageId, response);
            logger.info("Response added successfully to message ID: {}", messageId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("Error adding response to message ID: {}", messageId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error adding response to message ID: {}", messageId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add response: " + e.getMessage());
        }
    }

    // GET ALL MESSAGES SENT BY USER (as buyer)
    @GetMapping(value = "/messages/sent/{userEmail}", produces = "application/json;charset=UTF-8")
    public List<Message> getMessagesSentByUser(@PathVariable String userEmail) {
        return messageService.getMessagesSentByUser(userEmail);
    }

    // GET ALL MESSAGES FOR USER'S ITEMS (as seller)
    @GetMapping(value = "/messages/received/{ownerEmail}", produces = "application/json;charset=UTF-8")
    public List<Message> getMessagesForUserItems(@PathVariable String ownerEmail) {
        return messageService.getMessagesForUserItems(ownerEmail);
    }
}
