package com.example.webshop.controllers;

import com.example.webshop.dto.CreateOrderRequest;
import com.example.webshop.models.Order;
import com.example.webshop.models.OrderStatus;
import com.example.webshop.services.OrderService;
import org.springframework.http.ResponseEntity;
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

    /** Лека заявка за "подгряване" на Render.com – health check за orders */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    // CREATE ORDER
    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    // GET ALL ORDERS
    @GetMapping
    public List<Order> getAll() {
        return orderService.getAllOrders();
    }

    // UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    public Order updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }
}
