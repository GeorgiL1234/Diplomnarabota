package com.example.webshop.controllers;

import com.example.webshop.exception.ApiException;
import com.example.webshop.models.VipPayment;
import com.example.webshop.services.VipPaymentService;
import com.example.webshop.validation.EmailValidation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/vip-payment")
@CrossOrigin(origins = "*")
public class VipPaymentController {

    private static final Logger logger = LoggerFactory.getLogger(VipPaymentController.class);
    private final VipPaymentService vipPaymentService;

    public VipPaymentController(VipPaymentService vipPaymentService) {
        this.vipPaymentService = vipPaymentService;
    }

    /**
     * Създава ново плащане за VIP статус
     * POST /vip-payment/create
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> request) {
        Long itemId = requireLong(request, "itemId");
        String ownerEmail = (String) request.get("ownerEmail");
        String paymentMethod = (String) request.getOrDefault("paymentMethod", "card");

        if (!"card".equalsIgnoreCase(paymentMethod)) {
            logger.error("VIP payment attempted with non-card method: {}", paymentMethod);
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "VIP status requires payment with a card. Please use card payment.");
        }

        String cardNumber = (String) request.get("cardNumber");
        String cardHolder = (String) request.get("cardHolder");
        String expiryDate = (String) request.get("expiryDate");

        if (cardNumber == null || cardNumber.length() < 4) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Card number is required and must have at least 4 digits");
        }

        if (cardHolder == null || cardHolder.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cardholder name is required");
        }

        if (expiryDate == null || expiryDate.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Expiry date is required");
        }

        logger.info("Creating VIP payment for item {} by user {} with card ending in {}",
                itemId, ownerEmail, cardNumber);

        VipPayment payment = vipPaymentService.createPayment(itemId, ownerEmail, paymentMethod,
                cardNumber, cardHolder, expiryDate);

        return ResponseEntity.ok(Map.of(
                "paymentId", payment.getId(),
                "itemId", payment.getItemId(),
                "amount", payment.getAmount(),
                "status", payment.getStatus(),
                "message", "Payment created successfully"
        ));
    }

    /**
     * Завършва плащането и активира VIP статуса
     * POST /vip-payment/complete
     */
    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completePayment(@RequestBody Map<String, Object> request) {
        Long paymentId = requireLong(request, "paymentId");
        String ownerEmail = request.get("ownerEmail") != null
                ? EmailValidation.trim(request.get("ownerEmail").toString()) : "";
        if (ownerEmail.isEmpty() || !EmailValidation.isValid(ownerEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid owner email address");
        }
        String paymentMethodId = (String) request.get("paymentMethodId");

        logger.info("Completing VIP payment {} by user {}", paymentId, ownerEmail);

        VipPayment payment = vipPaymentService.completePayment(paymentId, ownerEmail, paymentMethodId);

        return ResponseEntity.ok(Map.of(
                "paymentId", payment.getId(),
                "itemId", payment.getItemId(),
                "status", payment.getStatus(),
                "message", "Payment completed and VIP status activated"
        ));
    }

    /**
     * Връща цената за VIP
     * GET /vip-payment/price
     */
    @GetMapping("/price")
    public ResponseEntity<Map<String, Object>> getVipPrice() {
        return ResponseEntity.ok(Map.of(
                "price", vipPaymentService.getVipPrice(),
                "currency", "EUR"
        ));
    }

    private static Long requireLong(Map<String, Object> request, String key) {
        try {
            Object v = request.get(key);
            if (v == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, key + " is required");
            }
            return Long.valueOf(v.toString());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid " + key);
        }
    }
}
