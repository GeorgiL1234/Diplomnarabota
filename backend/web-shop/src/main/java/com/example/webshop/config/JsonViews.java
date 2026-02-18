package com.example.webshop.config;

/** JsonView за условно включване на imageUrl – само при GET /items/{id}, не при Message/списъци */
public class JsonViews {
    public interface WithImage {}
}
