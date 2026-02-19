package com.example.webshop.models;

import com.example.webshop.config.JsonViews;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.*;
import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reviews"})
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private double price;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    // За фронтенд разделяне на "обяви" и "моите обяви"
    @Column(nullable = true)
    private String ownerEmail;

    // Категория на обявата (примерно: ELECTRONICS, BOOKS, CLOTHES...)
    @Column(nullable = true)
    private String category;

    // Контакт за връзка с продавача (задължително поне едно от двете)
    @Column(nullable = true)
    private String contactEmail;

    @Column(nullable = true)
    private String contactPhone;

    // VIP статус - обявите с VIP се показват първи
    @Column(nullable = false)
    private Boolean isVip = false;

    // Начин на плащане - карта или кеш
    @Column(nullable = true)
    private String paymentMethod;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews;

    // getters & setters – id задължителен за create response (upload flow)
    @JsonView(JsonViews.WithImage.class)
    public Long getId() {
        return id;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @JsonView(JsonViews.WithImage.class)
    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    @JsonView(JsonViews.WithImage.class)
    public Boolean getIsVip() {
        return isVip != null ? isVip : false;
    }

    public void setIsVip(Boolean isVip) {
        this.isVip = isVip != null ? isVip : false;
    }

    @JsonView(JsonViews.WithImage.class)
    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
