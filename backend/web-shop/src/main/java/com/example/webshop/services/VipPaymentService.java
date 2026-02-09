package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.models.VipPayment;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.repositories.VipPaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class VipPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(VipPaymentService.class);
    private static final Double VIP_PRICE = 2.0; // 2 EUR

    private final VipPaymentRepository vipPaymentRepository;
    private final ItemRepository itemRepository;
    
    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    public VipPaymentService(VipPaymentRepository vipPaymentRepository, ItemRepository itemRepository) {
        this.vipPaymentRepository = vipPaymentRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * Създава ново плащане за VIP статус
     */
    @Transactional
    public VipPayment createPayment(Long itemId, String ownerEmail, String paymentMethod, 
                                   String cardLastFour, String cardHolder, String expiryDate) {
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

        // За VIP плащането ТРЯБВА да е с карта
        if (!"card".equalsIgnoreCase(paymentMethod)) {
            throw new RuntimeException("VIP status requires payment with a card");
        }

        VipPayment payment = new VipPayment(itemId, ownerEmail, VIP_PRICE);
        payment.setPaymentMethod(paymentMethod);
        payment.setCardLastFour(cardLastFour);
        payment.setCardHolder(cardHolder);
        payment.setExpiryDate(expiryDate);
        payment.setStatus("PENDING");

        logger.info("Creating VIP payment for item {} by user {} with card ending in {}", 
                itemId, ownerEmail, cardLastFour);
        return vipPaymentRepository.save(payment);
    }

    /**
     * Завършва плащането и активира VIP статуса
     * Използва Stripe за обработка на плащането
     */
    @Transactional
    public VipPayment completePayment(Long paymentId, String ownerEmail, String paymentMethodId) {
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

        // Обработка на плащането чрез Stripe
        if (stripeSecretKey != null && !stripeSecretKey.isEmpty() && paymentMethodId != null && !paymentMethodId.isEmpty()) {
            try {
                Stripe.apiKey = stripeSecretKey;
                
                // Създаване на Payment Intent
                PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                        .setAmount((long)(VIP_PRICE * 100)) // Stripe използва центове
                        .setCurrency("eur")
                        .setPaymentMethod(paymentMethodId)
                        .setConfirm(true)
                        .setReturnUrl("https://webshop-app-2026.vercel.app");
                
                PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
                
                if (!"succeeded".equals(paymentIntent.getStatus())) {
                    throw new RuntimeException("Payment failed: " + paymentIntent.getStatus());
                }
                
                logger.info("Stripe payment successful. PaymentIntent ID: {}", paymentIntent.getId());
            } catch (StripeException e) {
                logger.error("Stripe payment error", e);
                throw new RuntimeException("Payment processing failed: " + e.getMessage());
            }
        } else {
            if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
                logger.warn("Stripe secret key not configured. Skipping payment processing.");
            } else {
                logger.info("Payment method ID not provided. Processing payment without Stripe (demo mode).");
            }
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
     * Завършва плащането без Stripe (за обратна съвместимост)
     */
    @Transactional
    public VipPayment completePayment(Long paymentId, String ownerEmail) {
        return completePayment(paymentId, ownerEmail, null);
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
