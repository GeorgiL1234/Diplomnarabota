package com.example.webshop.exception;

import com.example.webshop.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Централизирано обработване на изключения – консистентен JSON ({@link ErrorResponse}) и логване.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(HttpServletRequest request, ApiException ex) {
        if (ex.getStatus().is4xxClientError()) {
            log.warn("API {}: {}", ex.getStatus().value(), ex.getMessage());
        } else {
            log.error("API {}: {}", ex.getStatus().value(), ex.getMessage());
        }
        return ResponseEntity
                .status(ex.getStatus())
                .body(ErrorResponse.of(request, ex.getStatus(), ex.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(HttpServletRequest request, ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String msg = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        if (status.is4xxClientError()) {
            log.warn("ResponseStatus {}: {}", status.value(), msg);
        } else {
            log.error("ResponseStatus {}: {}", status.value(), msg);
        }
        return ResponseEntity.status(status).body(ErrorResponse.of(request, status, msg));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleNotReadable(HttpServletRequest request, HttpMessageNotReadableException ex) {
        log.warn("Invalid request body: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(request, HttpStatus.BAD_REQUEST,
                        "Invalid request body. Check JSON format and field types."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(HttpServletRequest request, MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        log.warn("Validation: {}", msg);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(request, HttpStatus.BAD_REQUEST, msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(HttpServletRequest request, Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(request, HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred. Please try again later."));
    }
}
