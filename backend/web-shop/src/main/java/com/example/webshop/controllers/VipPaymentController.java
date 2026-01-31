package com.example.webshop.controllers;

import com.example.webshop.models.VipPayment;
import com.example.webshop.services.VipPaymentService;
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
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> request) {
        try {
            Long itemId = Long.valueOf(request.get("itemId").toString());
            String ownerEmail = (String) request.get("ownerEmail");
            String paymentMethod = (String) request.getOrDefault("paymentMethod", "card");

            logger.info("Creating VIP payment for item {} by user {}", itemId, ownerEmail);

            VipPayment payment = vipPaymentService.createPayment(itemId, ownerEmail, paymentMethod);

            return ResponseEntity.ok(Map.of(
                    "paymentId", payment.getId(),
                    "itemId", payment.getItemId(),
                    "amount", payment.getAmount(),
                    "status", payment.getStatus(),
                    "message", "Payment created successfully"
            ));
        } catch (RuntimeException e) {
            logger.error("Error creating VIP payment", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating VIP payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create payment: " + e.getMessage());
        }
    }

    /**
     * Завършва плащането и активира VIP статуса
     * POST /vip-payment/complete
     */
    @PostMapping("/complete")
    public ResponseEntity<?> completePayment(@RequestBody Map<String, Object> request) {
        try {
            Long paymentId = Long.valueOf(request.get("paymentId").toString());
            String ownerEmail = (String) request.get("ownerEmail");

            logger.info("Completing VIP payment {} by user {}", paymentId, ownerEmail);

            VipPayment payment = vipPaymentService.completePayment(paymentId, ownerEmail);

            return ResponseEntity.ok(Map.of(
                    "paymentId", payment.getId(),
                    "itemId", payment.getItemId(),
                    "status", payment.getStatus(),
                    "message", "Payment completed and VIP status activated"
            ));
        } catch (RuntimeException e) {
            logger.error("Error completing VIP payment", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error completing VIP payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to complete payment: " + e.getMessage());
        }
    }

    /**
     * Връща цената за VIP
     * GET /vip-payment/price
     */
    @GetMapping("/price")
    public ResponseEntity<?> getVipPrice() {
        return ResponseEntity.ok(Map.of(
                "price", vipPaymentService.getVipPrice(),
                "currency", "EUR"
        ));
    }
}
