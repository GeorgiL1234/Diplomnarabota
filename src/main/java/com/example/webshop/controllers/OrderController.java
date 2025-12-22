package com.example.webshop.controllers;

import com.example.webshop.dto.OrderRequest;
import com.example.webshop.models.Order;
import com.example.webshop.services.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // CREATE ORDER (checkout)
    @PostMapping
    public Order createOrder(@RequestBody OrderRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        return orderService.createOrder(userEmail, request);
    }

    // GET MY ORDERS
    @GetMapping
    public List<Order> myOrders(Authentication authentication) {

        String userEmail = authentication.getName();
        return orderService.getOrdersForUser(userEmail);
    }
}
