package com.example.webshop.controllers;

import com.example.webshop.dto.CreateItemOrderRequest;
import com.example.webshop.models.ItemOrder;
import com.example.webshop.services.ItemOrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/item-orders")
@CrossOrigin(origins = "*")
public class ItemOrderController {

    private final ItemOrderService itemOrderService;

    public ItemOrderController(ItemOrderService itemOrderService) {
        this.itemOrderService = itemOrderService;
    }

    // CREATE ITEM ORDER
    @PostMapping(consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public ItemOrder createOrder(@RequestBody CreateItemOrderRequest request) {
        return itemOrderService.createOrder(request);
    }

    // GET ORDERS BY CUSTOMER EMAIL
    @GetMapping(value = "/customer/{customerEmail}", produces = "application/json;charset=UTF-8")
    public List<ItemOrder> getOrdersByCustomer(@PathVariable String customerEmail) {
        return itemOrderService.getOrdersByCustomer(customerEmail);
    }

    // GET ORDERS FOR SELLER (by item owner email)
    @GetMapping(value = "/seller/{ownerEmail}", produces = "application/json;charset=UTF-8")
    public List<ItemOrder> getOrdersForSeller(@PathVariable String ownerEmail) {
        return itemOrderService.getOrdersForSeller(ownerEmail);
    }

    // UPDATE ORDER STATUS
    @PutMapping(value = "/{orderId}/status", consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
    public ItemOrder updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return itemOrderService.updateOrderStatus(orderId, status);
    }
}
