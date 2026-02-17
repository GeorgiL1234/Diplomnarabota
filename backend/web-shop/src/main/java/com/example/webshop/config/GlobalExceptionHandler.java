package com.example.webshop.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Глобален handler за грешки – логва пълния stack trace за дебъг на 500 грешки.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String BUILD = "image-in-create-v2";

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleMessageNotReadable(HttpMessageNotReadableException e) {
        logger.error("JSON parse error (request body too large or invalid?): {}", e.getMessage());
        logger.error("Full stack:", e);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "Invalid request body. Try a smaller image (under 300KB).",
                        "build", BUILD
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        logger.error("Unhandled error: {}", e.getMessage());
        logger.error("Full stack trace:", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Internal server error: " + e.getClass().getSimpleName(),
                        "message", e.getMessage() != null ? e.getMessage() : "Unknown",
                        "build", BUILD
                ));
    }
}
