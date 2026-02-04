package com.example.webshop.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_orders")
public class ItemOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = true)
    private String customerName;

    @Column(nullable = true)
    private String customerPhone;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(nullable = false)
    private String paymentMethod; // "card", "revolut", "cash_on_delivery"

    @Column(nullable = false)
    private String deliveryMethod; // "speedy", "econt"

    @Column(nullable = false, length = 500)
    private String deliveryAddress;

    @Column(nullable = false)
    private double totalPrice;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    public ItemOrder() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(String deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
}
