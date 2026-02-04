package com.example.webshop.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vip_payments")
public class VipPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private String ownerEmail;

    @Column(nullable = false)
    private Double amount; // 2.0 EUR

    @Column(nullable = false)
    private String status; // PENDING, COMPLETED, FAILED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime completedAt;

    @Column(nullable = true)
    private String paymentMethod; // card, bank_transfer, etc.

    @Column(nullable = true)
    private String cardLastFour; // Последните 4 цифри на картата за сигурност

    @Column(nullable = true)
    private String cardHolder; // Име на картодържателя

    @Column(nullable = true)
    private String expiryDate; // Дата на изтичане (MM/YY)

    public VipPayment() {
    }

    public VipPayment(Long itemId, String ownerEmail, Double amount) {
        this.itemId = itemId;
        this.ownerEmail = ownerEmail;
        this.amount = amount;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCardLastFour() {
        return cardLastFour;
    }

    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }

    public String getCardHolder() {
        return cardHolder;
    }

    public void setCardHolder(String cardHolder) {
        this.cardHolder = cardHolder;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }
}
