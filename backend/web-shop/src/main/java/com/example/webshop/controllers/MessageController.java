package com.example.webshop.controllers;

import com.example.webshop.dto.AddMessageRequest;
import com.example.webshop.exception.ApiException;
import com.example.webshop.models.Message;
import com.example.webshop.services.MessageService;
import com.example.webshop.validation.EmailValidation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public Message addMessage(
            @PathVariable Long itemId,
            @RequestBody AddMessageRequest request) {
        logger.info("Received message creation request for item ID: {}", itemId);

        if (request == null) {
            logger.error("Request is null");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Message data is required");
        }

        Message message = new Message();
        message.setSenderEmail(request.getSenderEmail());
        message.setContent(request.getContent());

        Message saved = messageService.addMessage(itemId, message);
        logger.info("Message created successfully with ID: {} for item ID: {}", saved.getId(), itemId);
        return saved;
    }

    // GET MESSAGES FOR ITEM
    @GetMapping(value = "/{itemId}/messages", produces = "application/json;charset=UTF-8")
    public List<Message> getMessages(@PathVariable Long itemId) {
        return messageService.getMessagesForItem(itemId);
    }

    // ADD RESPONSE TO MESSAGE
    @PutMapping(value = "/messages/{messageId}/response", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Message addResponse(
            @PathVariable Long messageId,
            @RequestBody Map<String, String> request) {
        logger.info("Received response request for message ID: {}", messageId);

        if (request == null || !request.containsKey("response")) {
            logger.error("Response data is missing");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Response data is required");
        }

        String response = request.get("response");
        if (response == null || response.trim().isEmpty()) {
            logger.error("Response content is empty");
            throw new ApiException(HttpStatus.BAD_REQUEST, "Response content cannot be empty");
        }

        Message updated = messageService.addResponse(messageId, response);
        logger.info("Response added successfully to message ID: {}", messageId);
        return updated;
    }

    // GET ALL MESSAGES SENT BY USER (as buyer)
    @GetMapping(value = "/messages/sent/{userEmail}", produces = "application/json;charset=UTF-8")
    public List<Message> getMessagesSentByUser(@PathVariable String userEmail) {
        return messageService.getMessagesSentByUser(requireValidEmail(userEmail));
    }

    // GET ALL MESSAGES FOR USER'S ITEMS (as seller)
    @GetMapping(value = "/messages/received/{ownerEmail}", produces = "application/json;charset=UTF-8")
    public List<Message> getMessagesForUserItems(@PathVariable String ownerEmail) {
        return messageService.getMessagesForUserItems(requireValidEmail(ownerEmail));
    }

    private static String requireValidEmail(String email) {
        String e = EmailValidation.trim(email);
        if (!EmailValidation.isValid(e)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email address");
        }
        return e;
    }
}
