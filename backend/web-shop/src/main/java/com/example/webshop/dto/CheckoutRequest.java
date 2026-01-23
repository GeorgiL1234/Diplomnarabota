package com.example.webshop.dto;

import java.util.List;

public class CheckoutRequest {

    public List<ItemRequest> items;

    public static class ItemRequest {
        public Long itemId;
        public int quantity;
    }
}
