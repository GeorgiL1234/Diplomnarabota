package com.example.webshop.repositories;

import com.example.webshop.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByItemId(Long itemId);
    
    List<Message> findByItemIdOrderByCreatedAtDesc(Long itemId);
    
    // Въпроси, които потребителят е задал (като купувач)
    List<Message> findBySenderEmailOrderByCreatedAtDesc(String senderEmail);
    
    // Въпроси, зададени към обяви на потребителя (като продавач)
    @Query("SELECT m FROM Message m JOIN m.item i WHERE i.ownerEmail = :ownerEmail ORDER BY m.createdAt DESC")
    List<Message> findMessagesForOwnerItems(@Param("ownerEmail") String ownerEmail);
}
