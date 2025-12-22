package com.example.webshop.services;

import com.example.webshop.dto.OrderItemRequest;
import com.example.webshop.dto.OrderRequest;
import com.example.webshop.models.*;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.repositories.OrderRepository;
import com.example.webshop.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
            ItemRepository itemRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    public Order createOrder(String userEmail, OrderRequest request) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);

        List<OrderItem> orderItems = new ArrayList<>();
        double totalPrice = 0;

        for (OrderItemRequest itemReq : request.getItems()) {

            Item item = itemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            double itemTotal = item.getPrice() * itemReq.getQuantity();

            OrderItem orderItem = new OrderItem(
                    order,
                    item,
                    itemReq.getQuantity(),
                    itemTotal);

            orderItems.add(orderItem);
            totalPrice += itemTotal;
        }

        order.setItems(orderItems);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.CREATED);

        return orderRepository.save(order);
    }

    public List<Order> getOrdersForUser(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUser(user);
    }
}
