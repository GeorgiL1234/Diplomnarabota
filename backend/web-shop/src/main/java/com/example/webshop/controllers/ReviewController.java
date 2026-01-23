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

    // CREATE REVIEW (UTF-8 FIX)
    @PostMapping(value = "/{itemId}/reviews", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public Review addReview(
            @PathVariable Long itemId,
            @RequestBody Review review) {
        return reviewService.addReview(itemId, review);
    }

    // GET REVIEWS FOR ITEM
    @GetMapping(value = "/{itemId}/reviews", produces = "application/json;charset=UTF-8")
    public List<Review> getReviews(@PathVariable Long itemId) {
        return reviewService.getReviewsForItem(itemId);
    }
}
