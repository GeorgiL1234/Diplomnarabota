package com.example.webshop.controllers;

import com.example.webshop.models.Review;
import com.example.webshop.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Оставяне на оценка
    @PostMapping("/add")
    public Review addReview(@RequestBody Review review) {
        return reviewService.leaveReview(review);
    }

    // Всички оценки на конкретен продавач
    @GetMapping("/{sellerUsername}")
    public List<Review> getSellerReviews(@PathVariable String sellerUsername) {
        return reviewService.getReviewsForSeller(sellerUsername);
    }

    // Средна оценка на продавача
    @GetMapping("/avg/{sellerUsername}")
    public double getAverageRating(@PathVariable String sellerUsername) {
        return reviewService.getAverageRating(sellerUsername);
    }
}
