package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.models.VipPayment;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.repositories.VipPaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class VipPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(VipPaymentService.class);
    private static final Double VIP_PRICE = 2.0; // 2 EUR

    private final VipPaymentRepository vipPaymentRepository;
    private final ItemRepository itemRepository;

    public VipPaymentService(VipPaymentRepository vipPaymentRepository, ItemRepository itemRepository) {
        this.vipPaymentRepository = vipPaymentRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * Създава ново плащане за VIP статус
     */
    @Transactional
    public VipPayment createPayment(Long itemId, String ownerEmail, String paymentMethod) {
        // Проверка дали обявата съществува
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        // Проверка дали потребителят е собственик
        if (item.getOwnerEmail() == null || !item.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You can only pay for VIP for your own listings");
        }

        // Проверка дали вече има активна VIP обява
        if (item.getIsVip() != null && item.getIsVip()) {
            throw new RuntimeException("This listing is already VIP");
        }

        // Проверка дали вече има pending плащане
        vipPaymentRepository.findByItemIdAndStatus(itemId, "PENDING")
                .ifPresent(payment -> {
                    throw new RuntimeException("A payment is already pending for this listing");
                });

        VipPayment payment = new VipPayment(itemId, ownerEmail, VIP_PRICE);
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus("PENDING");

        logger.info("Creating VIP payment for item {} by user {}", itemId, ownerEmail);
        return vipPaymentRepository.save(payment);
    }

    /**
     * Завършва плащането и активира VIP статуса
     */
    @Transactional
    public VipPayment completePayment(Long paymentId, String ownerEmail) {
        VipPayment payment = vipPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        // Проверка дали потребителят е собственик на плащането
        if (!payment.getOwnerEmail().equals(ownerEmail)) {
            throw new RuntimeException("You can only complete your own payments");
        }

        // Проверка дали плащането вече е завършено
        if ("COMPLETED".equals(payment.getStatus())) {
            throw new RuntimeException("Payment is already completed");
        }

        // Активирай VIP статуса на обявата
        Item item = itemRepository.findById(payment.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found: " + payment.getItemId()));

        item.setIsVip(true);
        itemRepository.save(item);

        // Обнови плащането
        payment.setStatus("COMPLETED");
        payment.setCompletedAt(LocalDateTime.now());

        logger.info("Completing VIP payment {} for item {}", paymentId, payment.getItemId());
        return vipPaymentRepository.save(payment);
    }

    /**
     * Проверява дали има завършено плащане за обява
     */
    public boolean hasCompletedPayment(Long itemId) {
        return vipPaymentRepository.findByItemIdAndStatus(itemId, "COMPLETED").isPresent();
    }

    /**
     * Връща цената за VIP
     */
    public Double getVipPrice() {
        return VIP_PRICE;
    }
}
