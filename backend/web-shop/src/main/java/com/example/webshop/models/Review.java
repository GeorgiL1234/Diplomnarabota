package com.example.webshop.models;

import jakarta.persistence.*;

@Entity
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reviewerUsername; // кой оставя оценката
    private String sellerUsername; // на кого е оценката

    private int rating; // 1–5 звезди

    @Column(length = 1000)
    private String comment;

    public Review() {
    }

    public Review(String reviewerUsername, String sellerUsername, int rating, String comment) {
        this.reviewerUsername = reviewerUsername;
        this.sellerUsername = sellerUsername;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getReviewerUsername() {
        return reviewerUsername;
    }

    public void setReviewerUsername(String reviewerUsername) {
        this.reviewerUsername = reviewerUsername;
    }

    public String getSellerUsername() {
        return sellerUsername;
    }

    public void setSellerUsername(String sellerUsername) {
        this.sellerUsername = sellerUsername;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
