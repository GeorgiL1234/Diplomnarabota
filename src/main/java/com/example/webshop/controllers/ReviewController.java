package com.example.webshop.controllers;

import com.example.webshop.models.Review;
import com.example.webshop.services.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{itemId}/reviews")
    public Review addReview(
            @PathVariable Long itemId,
            @RequestBody Review review) {
        return reviewService.addReview(itemId, review);
    }

    @GetMapping("/{itemId}/reviews")
    public List<Review> getReviews(@PathVariable Long itemId) {
        return reviewService.getReviewsForItem(itemId);
    }
}
