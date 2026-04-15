package com.example.webshop.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Отговор при успешен login/register – JWT за stateless автентикация. */
public record AuthResponse(
        @JsonProperty("accessToken") String accessToken,
        @JsonProperty("tokenType") String tokenType,
        @JsonProperty("email") String email) {
}
