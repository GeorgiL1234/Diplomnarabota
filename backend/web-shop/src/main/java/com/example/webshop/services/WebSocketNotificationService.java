package com.example.webshop.services;

import com.example.webshop.models.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Изпраща real-time известия чрез WebSocket при нови съобщения/отговори.
 */
@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /** Извести продавача (собственика на обявата) за ново съобщение */
    public void notifyNewMessage(Message message) {
        if (message == null || message.getItem() == null) return;
        String ownerEmail = message.getItem().getOwnerEmail();
        if (ownerEmail == null || ownerEmail.isBlank()) return;
        try {
            String topic = "/topic/messages/" + ownerEmail.replace("@", "_at_").replace(".", "_");
            messagingTemplate.convertAndSend(topic, "new_message");
            logger.debug("WebSocket: notified {} for new message", ownerEmail);
        } catch (Exception e) {
            logger.warn("WebSocket notify failed: {}", e.getMessage());
        }
    }

    /** Извести купувача (подателя) за нов отговор */
    public void notifyNewResponse(Message message) {
        if (message == null) return;
        String senderEmail = message.getSenderEmail();
        if (senderEmail == null || senderEmail.isBlank()) return;
        try {
            String topic = "/topic/messages/" + senderEmail.replace("@", "_at_").replace(".", "_");
            messagingTemplate.convertAndSend(topic, "new_response");
            logger.debug("WebSocket: notified {} for new response", senderEmail);
        } catch (Exception e) {
            logger.warn("WebSocket notify failed: {}", e.getMessage());
        }
    }
}
