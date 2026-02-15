package com.example.webshop.repositories;

import com.example.webshop.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByItemId(Long itemId);
    
    @Query("SELECT m FROM Message m JOIN FETCH m.item WHERE m.item.id = :itemId ORDER BY m.createdAt DESC")
    List<Message> findByItemIdOrderByCreatedAtDesc(@Param("itemId") Long itemId);
    
    // Въпроси, които потребителят е задал (като купувач)
    @Query("SELECT m FROM Message m JOIN FETCH m.item WHERE m.senderEmail = :senderEmail ORDER BY m.createdAt DESC")
    List<Message> findBySenderEmailOrderByCreatedAtDesc(@Param("senderEmail") String senderEmail);
    
    // Въпроси, зададени към обяви на потребителя (като продавач)
    @Query("SELECT m FROM Message m JOIN FETCH m.item i WHERE i.ownerEmail = :ownerEmail ORDER BY m.createdAt DESC")
    List<Message> findMessagesForOwnerItems(@Param("ownerEmail") String ownerEmail);
}
