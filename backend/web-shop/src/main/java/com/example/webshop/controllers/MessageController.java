package com.example.webshop.controllers;

import com.example.webshop.models.Message;
import com.example.webshop.services.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // CREATE MESSAGE/QUESTION
    @PostMapping(value = "/{itemId}/messages", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Message addMessage(
            @PathVariable Long itemId,
            @RequestBody Message message) {
        return messageService.addMessage(itemId, message);
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
        String response = request.get("response");
        return messageService.addResponse(messageId, response);
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
