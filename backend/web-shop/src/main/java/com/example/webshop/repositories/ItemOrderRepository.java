package com.example.webshop.repositories;

import com.example.webshop.models.ItemOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemOrderRepository extends JpaRepository<ItemOrder, Long> {
    List<ItemOrder> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    
    @Query("SELECT o FROM ItemOrder o WHERE o.item.ownerEmail = :ownerEmail ORDER BY o.createdAt DESC")
    List<ItemOrder> findByItemOwnerEmailOrderByCreatedAtDesc(@Param("ownerEmail") String ownerEmail);
}
