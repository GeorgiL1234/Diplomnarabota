package com.example.webshop.services;

import com.example.webshop.dto.CreateItemOrderRequest;
import com.example.webshop.exception.ApiException;
import com.example.webshop.models.Item;
import org.springframework.http.HttpStatus;
import com.example.webshop.models.ItemOrder;
import com.example.webshop.repositories.ItemOrderRepository;
import com.example.webshop.repositories.ItemRepository;
import com.example.webshop.validation.EmailValidation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ItemOrderService {

    private final ItemOrderRepository itemOrderRepository;
    private final ItemRepository itemRepository;

    public ItemOrderService(ItemOrderRepository itemOrderRepository, ItemRepository itemRepository) {
        this.itemOrderRepository = itemOrderRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public ItemOrder createOrder(CreateItemOrderRequest request) {
        String customerEmail = EmailValidation.trim(request.getCustomerEmail());
        if (customerEmail.isEmpty() || !EmailValidation.isValid(customerEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid customer email address");
        }
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item not found"));

        ItemOrder order = new ItemOrder();
        order.setCustomerEmail(customerEmail);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setItem(item);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setDeliveryMethod(request.getDeliveryMethod());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTotalPrice(item.getPrice());
        order.setStatus("PENDING"); // Начален статус

        return itemOrderRepository.saveAndFlush(order);
    }

    public List<ItemOrder> getOrdersByCustomer(String customerEmail) {
        return itemOrderRepository.findByCustomerEmailOrderByCreatedAtDesc(customerEmail);
    }

    public List<ItemOrder> getOrdersForSeller(String ownerEmail) {
        return itemOrderRepository.findByItemOwnerEmailOrderByCreatedAtDesc(ownerEmail);
    }

    @Transactional
    public ItemOrder updateOrderStatus(Long orderId, String status) {
        ItemOrder order = itemOrderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        return itemOrderRepository.saveAndFlush(order);
    }
}
