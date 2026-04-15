package com.example.webshop.services;

import com.example.webshop.dto.CreateOrderRequest;
import com.example.webshop.exception.ApiException;
import com.example.webshop.models.*;
import org.springframework.http.HttpStatus;
import com.example.webshop.repositories.OrderRepository;
import com.example.webshop.validation.EmailValidation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        String customerEmail = EmailValidation.trim(request.getCustomerEmail());
        if (customerEmail.isEmpty() || !EmailValidation.isValid(customerEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid customer email address");
        }
        Order order = new Order();
        order.setCustomerEmail(customerEmail);
        order.setStatus(OrderStatus.CREATED);
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.ItemRequest i : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductName(i.getProductName());
            item.setPrice(i.getPrice());
            item.setQuantity(i.getQuantity());
            item.setOrder(order);

            BigDecimal line = i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
            total = total.add(line);
            items.add(item);
        }

        order.setItems(items);
        order.setTotalPrice(total.setScale(4, RoundingMode.HALF_UP));

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        order.setStatus(status);
        return orderRepository.save(order);
    }
}
