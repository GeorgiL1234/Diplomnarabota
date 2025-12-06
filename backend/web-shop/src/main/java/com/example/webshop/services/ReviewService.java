package com.example.webshop.services;

import com.example.webshop.models.Review;
import com.example.webshop.repositories.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // Метод за оставяне на ревю
    public Review leaveReview(Review review) {
        return reviewRepository.save(review);
    }

    // Връща всички ревюта за конкретен продавач
    public List<Review> getReviewsForSeller(String sellerUsername) {
        return reviewRepository.findAll()
                .stream()
                .filter(r -> r.getSellerUsername().equalsIgnoreCase(sellerUsername))
                .toList();
    }

    // Среден рейтинг за продавача
    public double getAverageRating(String sellerUsername) {
        List<Review> reviews = getReviewsForSeller(sellerUsername);

        if (reviews.isEmpty()) {
            return 0.0;
        }

        return reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
    }

    // Метод, който вече имаш – доработен ако ти трябва
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
}
