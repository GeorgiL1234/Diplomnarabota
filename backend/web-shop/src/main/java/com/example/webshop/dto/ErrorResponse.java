package com.example.webshop.dto;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;

import java.time.Instant;

/**
 * Единен JSON формат за грешки от API (REST + @RestControllerAdvice).
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
    public static ErrorResponse of(HttpServletRequest request, HttpStatus httpStatus, String message) {
        return new ErrorResponse(
                Instant.now(),
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                message != null ? message : httpStatus.getReasonPhrase(),
                request.getRequestURI()
        );
    }
}
