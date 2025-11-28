package com.example.webshop.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Заглавие е задължително")
    private String title;

    @NotBlank(message = "Описание е задължително")
    private String description;

    @NotNull(message = "Цена е задължителна")
    private Double price;

    private String imageUrl; // ще пазим линк или път до снимката

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // кой е публикувал обявата

    // --- Конструктори ---
    public Item() {
    }

    public Item(String title, String description, Double price, String imageUrl, User user) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.user = user;
    }

    // --- Getters и Setters ---
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
