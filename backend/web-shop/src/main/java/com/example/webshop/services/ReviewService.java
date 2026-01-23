package com.example.webshop.services;

import com.example.webshop.models.Item;
import com.example.webshop.models.Review;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.repositories.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ItemRepository itemRepository;

    public ReviewService(ReviewRepository reviewRepository, ItemRepository itemRepository) {
        this.reviewRepository = reviewRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Review addReview(Long itemId, Review review) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        review.setItem(item);
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsForItem(Long itemId) {
        return reviewRepository.findByItemId(itemId);
    }
}
