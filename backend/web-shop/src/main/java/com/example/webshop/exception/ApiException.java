package com.example.webshop.exception;

import org.springframework.http.HttpStatus;

/**
 * Контролирана бизнес грешка с HTTP статус – обработва се от {@link GlobalExceptionHandler}.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public ApiException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
