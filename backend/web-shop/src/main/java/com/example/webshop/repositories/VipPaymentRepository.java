package com.example.webshop.repositories;

import com.example.webshop.models.VipPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VipPaymentRepository extends JpaRepository<VipPayment, Long> {
    Optional<VipPayment> findByItemIdAndStatus(Long itemId, String status);
    List<VipPayment> findByOwnerEmail(String ownerEmail);
    List<VipPayment> findByItemId(Long itemId);
}
