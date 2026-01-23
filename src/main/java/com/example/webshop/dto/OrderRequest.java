package com.example.webshop.dto;

import java.util.List;

public class OrderRequest {

    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
