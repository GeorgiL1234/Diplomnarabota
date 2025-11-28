package com.example.webshop.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity // Казваме на Spring, че това е таблица в базата данни
@Table(name = "users") // Името на таблицата в базата данни
public class User {

    @Id // Първичен ключ
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Автоматично генериране на ID
    private Long id;

    @NotBlank(message = "Username е задължителен")
    private String username;

    @Email(message = "Email трябва да е валиден")
    @NotBlank(message = "Email е задължителен")
    private String email;

    @NotBlank(message = "Password е задължителна")
    private String password;

    // --- Конструктори ---
    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // --- Getters и Setters ---
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
